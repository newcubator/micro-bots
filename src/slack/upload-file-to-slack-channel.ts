import { slackClient } from "../clients/slack";
import { UploadPayload } from "./types/slack-types";
import { FilesCompleteUploadExternalResponse } from "@slack/web-api";

export const uploadFileToSlackChannel = async (
  payload: UploadPayload,
): Promise<FilesCompleteUploadExternalResponse> => {
  const response = await slackClient.files.getUploadURLExternal({
    filename: payload.filename,
    length: payload.file.length,
  });

  await fetch(response.upload_url, {
    method: "POST",
    body: payload.file,
  });

  return await slackClient.files.completeUploadExternal({
    files: [
      {
        id: response.file_id,
      },
    ],
    channels: payload.channels,
    initial_comment: payload.initial_comment,
    thread_ts: payload.thread_ts,
  });
};
