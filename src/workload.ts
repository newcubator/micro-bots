import {APIGatewayEvent} from 'aws-lambda';
import dayjs from 'dayjs';
import {decode} from 'querystring';
import {getUserActivities} from './moco/activities';
import {getUserEmployments} from './moco/employments';
import {getUserSchedules} from './moco/schedules';
import {findUserBySlackCommand, getUsers} from './moco/users';
import {SlackCommandTypes} from './types/slack-command-types';
import {MocoUserType} from "./types/moco-types";
import {calculateWorkload} from "./workload/calculate-workload";
import {WorkloadType} from "./types/workload-types";
import {createSlackResponseWorkload} from "./workload/create-slack-response-workload";

const DEFAULT_DURATION = 21;

export async function handler(event: APIGatewayEvent) {
  const command: SlackCommandTypes = decode(event.body) as SlackCommandTypes;
  const userPromise: Promise<MocoUserType> = getUsers()
    .then(findUserBySlackCommand(command))

  let duration = parseInt(command.text.trim());
  if (!Number.isInteger(duration)) {
    duration = DEFAULT_DURATION;
  }

  const from = dayjs().subtract(duration, 'day').format('YYYY-MM-DD');
  const to = dayjs().subtract(0, 'day').format('YYYY-MM-DD');
  console.log(`Analysing from ${from} to ${to}`);

  const user = await userPromise;
  if (!user) {
    return {
      statusCode: 200,
      body: `Ich konnte dich leider keinem Moco User zuordnen.`
    };
  }

  const workloadPromise: Promise<WorkloadType> = Promise.all([
    getUserSchedules(from, to, user.id),
    getUserEmployments(from, to, user.id),
    getUserActivities(from, to, user.id)
  ]).then(calculateWorkload(from, to))


  const workload = await workloadPromise;


  return {
    statusCode: 200,
    body: JSON.stringify(createSlackResponseWorkload(workload, duration, from, to))
  };
}
