import {APIGatewayEvent, ScheduledEvent} from "aws-lambda";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday"
import weekOfYear from "dayjs/plugin/weekOfYear"
import {getUserSchedules} from "./moco/schedules";
import {getUserEmployments} from "./moco/employments";
import {getUserActivities} from "./moco/activities";
import {calculateWorkload} from "./workload/calculate-workload";
import {getUsers} from "./moco/users";
import {createSlackResponseWorkloadAll} from "./workload/create-slack-response-workload";
import {SlackCommandTypes} from "./types/slack-command-types";
import {decode} from "querystring";
import {WebClient} from "@slack/web-api";

dayjs.extend(weekday)
dayjs.extend(weekOfYear)

const DEFAULT_FROM = 6;

let from = dayjs()
let to = dayjs()

export const handler = async (event: APIGatewayEvent | ScheduledEvent) => {
  let slack: WebClient = null
  if (eventIsApiGatewayEvent(event)) {
    let command: SlackCommandTypes = decode(event.body) as SlackCommandTypes
    if (command.text) {
      command.text = command.text.replace(" ", "").toLowerCase()
      let kw = command.text.match(/^kw\s*(\d{1,2})$/)
      if (kw) {
        from = from.week(parseInt(kw[1]))
        from = from.weekday(1)
        to = from.add(6, "day")
      } else {
        let dur = parseInt(command.text.trim())
        if (Number.isInteger(dur)) {
          from = from.subtract(dur - 1, "day");
        }
      }
    } else {
      from = from.subtract(DEFAULT_FROM, "day")
    }
  } else {
    slack = new WebClient(process.env.SLACK_TOKEN)
  }

  const fromString = from.format('YYYY-MM-DD');
  const toString = to.format('YYYY-MM-DD');
  console.log(`Analysing from ${fromString} to ${toString}`);

  const users = await getUsers()

  const userPromiseArray = users.map(user => {
    return Promise.all([
      getUserSchedules(fromString, toString, user.id),
      getUserEmployments(fromString, toString, user.id),
      getUserActivities(fromString, toString, user.id)
    ]).then(calculateWorkload(fromString, toString))
  })

  const workload = await Promise.all(userPromiseArray)

  if (eventIsApiGatewayEvent(event)) {
    return {
      statusCode: 200,
      body: JSON.stringify(createSlackResponseWorkloadAll(workload, from, to))
    }
  } else if (eventIsScheduledEvent(event)) {
    await slack?.chat.postMessage({
      text: "Wöchentliche Auslastung",
      channel: process.env.WORKLOAD_CHANNEL,
      username: "Moco Bot",
      ...createSlackResponseWorkloadAll(workload, from, to)
    })
  }
}

function eventIsApiGatewayEvent(event: APIGatewayEvent | ScheduledEvent): event is APIGatewayEvent {
  return (event as APIGatewayEvent).httpMethod !== undefined;
}

function eventIsScheduledEvent(event: APIGatewayEvent | ScheduledEvent): event is ScheduledEvent {
  return (event as ScheduledEvent).detail !== undefined;
}
