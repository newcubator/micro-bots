const axios = require("axios");
const moment = require("moment");
const { WebClient } = require("@slack/web-api");

const MOCO_URL = "https://newcubator.mocoapp.com/api/v1/users";
const MOCO_TOKEN = process.env.MOCO_TOKEN;
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const LEAD_TIME = process.env.LEAD_TIME;

if (typeof SLACK_TOKEN === "undefined") {
  throw new Error("Slack token missing");
}

const slack = new WebClient(SLACK_TOKEN);

module.exports.bot = async (event) => {
  const searchDate = moment().add(LEAD_TIME, "days").format("MM-DD");
  console.log(`Searching for birthdays on the ${searchDate}`);

  const response = await axios.get(MOCO_URL, {
    headers: {
      Authorization: "Token token=" + MOCO_TOKEN,
    },
  });
  const users = response.data;
  const birthdays = users.filter(
    (user) => !!user.birthday && user.birthday.endsWith(searchDate)
  );
  birthdays.forEach(async (birthday) => {
    console.log(birthday);

    const channelName = `Berta congratulates: ${birthday.firstname}!`;
    const channelResponse = await slack.conversations.create({
      name: channelName,
      is_private: true,
    });
    console.debug(`Created channel ${JSON.stringify(channelResponse)}`);

    const userResponse = await slack.users.list();
    const invites = userResponse.members
      .filter((member) => !member.deleted)
      .filter((member) => !member.is_bot)
      .filter((member) => member.profile.email != birthday.email)
      .map((member) => member.id)
      .join(",");

    const inviteresponse = await slack.conversations.invite({
      channel: channelResponse.channel.id,
      users: invites,
    });

    console.debug(`Invited ${JSON.stringify(inviteresponse)}`);

    const day = moment(birthday.birthday).format("DD MMM");
    const messageResonse = await slack.chat.postMessage({
      text: `Hey Leute ${birthday.firstname} hat in ${leadTime} Tagen am ${day} Geburtstag! Habt ihr euch bereits über eine kleine Überraschung Gedanken gemacht?`,
      channel: channelResponse.channel.id,
      username: "Birthday Bot",
      icon_url:
        "https://gitlab.com/uploads/-/system/project/avatar/20934853/Birthday_Bot.png?width=64",
      icon_emoji: ":geburtstag:",
    });
    console.debug(`Wrote message ${JSON.stringify(messageResonse)}`);
  });
};
