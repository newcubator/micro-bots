import { EventBridgeEvent } from "aws-lambda";
import axios from "axios";
import { UploadLetterXpressEvent } from "../../slack/interaction-handler";
import { slackChatPostEphemeral } from "../../slack/slack";
import { convertPdfToBase64, getMd5Hash } from "./pdf-converter";

export const uploadHandler = async (event: EventBridgeEvent<string, UploadLetterXpressEvent>) => {
  const { data: pdf } = await axios.get(event.detail.file, {
    responseType: "arraybuffer",
    responseEncoding: "binary",
    headers: { "Content-Type": "application/pdf", Authorization: `Bearer ${process.env.SLACK_TOKEN}` },
  });

  let pdfBase64 = await convertPdfToBase64(pdf);
  let checkSum = await getMd5Hash(pdfBase64);

  const content = {
    auth: {
      username: process.env.LETTERXPRESS_USER,
      apikey: process.env.LETTERXPRESS_KEY,
    },
    letter: {
      base64_file: pdfBase64,
      base64_checksum: checkSum,
      specification: {
        color: "4",
        mode: "simplex",
        ship: "national",
        c4: "n",
      },
    },
  };
  try {
    let upload = await axios.post("https://api.letterxpress.de/v1/setJob", content);
    if (upload.data.message === "OK") {
      await slackChatPostEphemeral(event.detail.channelId, "Der Brief ist jetzt unterwegs!", event.detail.sender);
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
