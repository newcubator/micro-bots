import {APIGatewayEvent, ScheduledEvent} from "aws-lambda";
import dayjs from "dayjs";
import {getUserSchedules} from "./moco/schedules";
import {getUserEmployments} from "./moco/employments";
import {getUserActivities} from "./moco/activities";
import {calculateWorkload} from "./workload/calculate-workload";
import {getUsers} from "./moco/users";
import {createSlackResponseWorkloadAll} from "./workload/create-slack-response-workload";
import {SlackCommandTypes} from "./types/slack-command-types";
import {decode} from "querystring";
import {WebClient} from "@slack/web-api";

const DEFAULT_DURATION = 7;

export const handler = async (event: APIGatewayEvent | ScheduledEvent) => {
  let duration = DEFAULT_DURATION;
  let slack: WebClient = null
  if (eventIsApiGatewayEvent(event)) {
    let command: SlackCommandTypes = decode(event.body) as SlackCommandTypes
    let dur = parseInt(command.text.trim())
    if (Number.isInteger(dur)) {
      duration = dur;
    }
  } else {
    slack = new WebClient(process.env.SLACK_TOKEN)
  }

  const from = dayjs().subtract(duration, 'day').format('YYYY-MM-DD');
  const to = dayjs().subtract(0, 'day').format('YYYY-MM-DD');
  console.log(`Analysing from ${from} to ${to}`);

  const users = await getUsers()

  const userPromiseArray = users.map(user => {
    return Promise.all([
      getUserSchedules(from, to, user.id),
      getUserEmployments(from, to, user.id),
      getUserActivities(from, to, user.id)
    ]).then(calculateWorkload(duration, to))
  })

  const workload = await Promise.all(userPromiseArray)

  console.log(JSON.stringify(createSlackResponseWorkloadAll(workload, duration).blocks, null, 4))

  if (eventIsApiGatewayEvent(event)) {
    return {
      statusCode: 200,
      body: JSON.stringify(createSlackResponseWorkloadAll(workload, duration))
    }
  } else if (eventIsScheduledEvent(event)) {
    await slack?.chat.postMessage({
      text: "Wöchentliche Auslastung",
      channel: process.env.WORKLOAD_CHANNEL,
      username: "Moco Bot",
      ...createSlackResponseWorkloadAll(workload, duration)
    })
  }
}

function eventIsApiGatewayEvent(event: APIGatewayEvent | ScheduledEvent): event is APIGatewayEvent {
  return (event as APIGatewayEvent).httpMethod !== undefined;
}

function eventIsScheduledEvent(event: APIGatewayEvent | ScheduledEvent): event is ScheduledEvent {
  return (event as ScheduledEvent).detail !== undefined;
}
