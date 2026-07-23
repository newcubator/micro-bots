import { slackClient } from "../clients/slack";
import { UploadPayload } from "./types/slack-types";
import { FilesCompleteUploadExternalResponse } from "@slack/web-api";
import axios from "axios";

export const uploadFileToSlackChannel = async (
  payload: UploadPayload,
): Promise<FilesCompleteUploadExternalResponse> => {
  const response = await slackClient.files.getUploadURLExternal({
    filename: payload.filename,
    length: payload.file.length,
  });

  if (!response.upload_url || !response.file_id) {
    throw new Error("Could not get Slack upload URL");
  }

  await axios.post(response.upload_url, payload.file);

  return await slackClient.files.completeUploadExternal({
    files: [
      {
        id: response.file_id,
      },
    ],
    channels: payload.channels ?? "",
    initial_comment: payload.initial_comment,
    thread_ts: payload.thread_ts,
  });
};
