import { slackClient } from "../clients/slack";

export let channelLog = async (channelId) => {
  console.log(
    await slackClient.conversations.join({
      channel: channelId,
    })
  );
};
