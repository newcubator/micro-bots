import {APIGatewayEvent, ScheduledEvent} from "aws-lambda";
import dayjs from "dayjs";
import {getUserSchedules} from "./moco/schedules";
import {getUserEmployments} from "./moco/employments";
import {getUserActivities} from "./moco/activities";
import {calculateWorkload} from "./workload/calculate-workload";
import {getUsers} from "./moco/users";
import {createSlackResponseWorkloadAll} from "./workload/create-slack-response-workload";

const DEFAULT_DURATION = 21;

export const handler = async (event) => {
  const duration = DEFAULT_DURATION;

  const from = dayjs().subtract(duration, 'day').format('YYYY-MM-DD');
  const to = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  console.log(`Analysing from ${from} to ${to}`);

  const users = await getUsers()

  const userPromiseArray = users.map(user => {
    return Promise.all([
      getUserSchedules(from, to, user.id),
      getUserEmployments(from, to, user.id),
      getUserActivities(from, to, user.id)
    ]).then(calculateWorkload(duration))
  })

  const workload = await Promise.all(userPromiseArray)

  return {
    statusCode: 200,
    body: JSON.stringify(createSlackResponseWorkloadAll(workload))
  }
}


function eventIsApiGatewayEvent(event: APIGatewayEvent | ScheduledEvent): event is APIGatewayEvent {
  return (event as APIGatewayEvent).httpMethod !== undefined;
}
