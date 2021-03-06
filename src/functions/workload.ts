import { APIGatewayEvent } from 'aws-lambda';
import dayjs from 'dayjs';
import { decode } from 'querystring';
import { getUserActivities } from '../moco/activities';
import { getUserEmployments } from '../moco/employments';
import { getUserSchedules } from '../moco/schedules';
import { MocoUserType } from '../moco/types/moco-types';
import { WorkloadType } from '../moco/types/workload-types';
import { findUserBySlackCommand, getUsers } from '../moco/users';
import { SlackCommandType } from '../slack/types/slack-types';
import { calculateWorkload } from '../workload/calculate-workload';
import { createSlackResponseWorkload } from '../workload/create-slack-response-workload';

const DEFAULT_DURATION = 21;

export const handler = async (event: APIGatewayEvent) => {
    const command: SlackCommandType = decode(event.body) as SlackCommandType;
    const userPromise: Promise<MocoUserType> = getUsers()
        .then(findUserBySlackCommand(command));

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
        getUserActivities(from, to, user.id),
        getUserEmployments(from, to, user.id),
        getUserSchedules(from, to, user.id)
    ]).then((input) => {
        const [activitiesResponse, employmentsResponse, schedulesResponse] = input;
        return calculateWorkload(from, to, activitiesResponse.data, employmentsResponse.data, schedulesResponse.data);
    });

    const workload = await workloadPromise;

    return {
        statusCode: 200,
        body: JSON.stringify(createSlackResponseWorkload(workload, duration, from, to))
    };
}
