import { slackClient } from "../clients/slack";

export const channelJoin = async (channelId: string) => {
  console.log(
    await slackClient.conversations.join({
      channel: channelId,
    }),
  );
};
