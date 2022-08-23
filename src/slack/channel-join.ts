import { slackClient } from "../clients/slack";

export let channelJoin = async (channelId) => {
  console.log(
    await slackClient.conversations.join({
      channel: channelId,
    })
  );
};
