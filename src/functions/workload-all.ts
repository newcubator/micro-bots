import { WebClient } from "@slack/web-api";
import { APIGatewayEvent, ScheduledEvent } from "aws-lambda";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { decode } from "querystring";
import { getActivities } from "../moco/activities";
import { getEmployments } from "../moco/employments";
import { getSchedules } from "../moco/schedules";
import { MocoActivity, MocoEmployment, MocoSchedule, MocoUserType } from "../moco/types/moco-types";
import { getUsers } from "../moco/users";
import { SlackCommandType } from "../slack/types/slack-types";
import { calculateWorkload } from "../workload/calculate-workload";
import { createSlackResponseWorkloadAll } from "../workload/create-slack-response-workload";

dayjs.extend(weekday);
dayjs.extend(weekOfYear);

const DEFAULT_FROM = 7;

let users: MocoUserType[];
let activities: MocoActivity[];
let employments: MocoEmployment[];
let schedules: MocoSchedule[];

export const handler = async (event: APIGatewayEvent | ScheduledEvent) => {
  let from = dayjs();
  let to = dayjs();
  let slack: WebClient = null;
  if (eventIsApiGatewayEvent(event)) {
    let command: SlackCommandType = decode(event.body) as SlackCommandType;
    if (command.text) {
      command.text = command.text.replace(" ", "").toLowerCase();
      let kw = command.text.match(/^kw\s*(\d{1,2})$/);
      if (kw) {
        from = from.week(parseInt(kw[1]));
        from = from.weekday(1);
        to = from.add(6, "day");
      } else {
        let dur = parseInt(command.text.trim());
        if (Number.isInteger(dur)) {
          from = from.subtract(dur - 1, "day");
        }
      }
    } else {
      from = from.subtract(DEFAULT_FROM, "day");
    }
  } else {
    from = from.subtract(DEFAULT_FROM, "day");
    slack = new WebClient(process.env.SLACK_TOKEN);
  }

  const fromString = from.format("YYYY-MM-DD");
  const toString = to.format("YYYY-MM-DD");
  console.log(`Analysing from ${fromString} to ${toString}`);

  await Promise.all([
    getUsers(),
    getActivities(fromString, toString),
    getEmployments(fromString, toString),
    getSchedules(fromString, toString),
  ]).then((input) => {
    const [usersResponse, activitiesResponse, employmentsResponse, schedulesResponse] = input;
    users = usersResponse;
    activities = activitiesResponse;
    employments = employmentsResponse;
    schedules = schedulesResponse;
  });

  const workloadArray = users.map((user) => {
    let userActivity = activities.filter((activity) => activity.user?.id == user.id);
    let userEmployments = employments.filter((employment) => employment.user?.id == user.id);
    let userSchedules = schedules.filter((schedules) => schedules.user?.id == user.id);
    return calculateWorkload(fromString, toString, userActivity, userEmployments, userSchedules);
  });

  const workload = await Promise.all(workloadArray);

  if (eventIsApiGatewayEvent(event)) {
    return {
      statusCode: 200,
      body: JSON.stringify(createSlackResponseWorkloadAll(workload, from, to)),
    };
  } else if (eventIsScheduledEvent(event)) {
    await slack?.chat.postMessage({
      text: "Wöchentliche Auslastung",
      channel: process.env.WORKLOAD_CHANNEL,
      username: "Moco Bot",
      ...createSlackResponseWorkloadAll(workload, from, to),
    });
  }
};

function eventIsApiGatewayEvent(event: APIGatewayEvent | ScheduledEvent): event is APIGatewayEvent {
  return (event as APIGatewayEvent).httpMethod !== undefined;
}

function eventIsScheduledEvent(event: APIGatewayEvent | ScheduledEvent): event is ScheduledEvent {
  return (event as ScheduledEvent).detail !== undefined;
}
