import { APIGatewayEvent } from 'aws-lambda';
import { decode } from 'querystring';
import {
    lockProjectSuccess,
    lockUnlockProjectErrorNoProjectFound,
    lockUnlockProjectErrorNoProjectId
} from '../lock-project/createSlackResponses';
import { getProject, putProjectContract } from '../moco/projects';
import { SlackCommandType } from '../slack/types/slack-types';

export const handler = async (event: APIGatewayEvent) => {
    const command: SlackCommandType = decode(event.body) as SlackCommandType;
    const projectId = command.text?.trim();
    console.time('Lock Project start');
    if (projectId === undefined) {
        return lockUnlockProjectErrorNoProjectId();
    }

    const project = await getProject(projectId);
    console.time('Lock Project get project');

    if (!project) {
        return lockUnlockProjectErrorNoProjectFound();
    }

    await Promise.all(project.contracts.map(contract => putProjectContract(projectId, {
        ...contract,
        active: false
    })));
    console.timeEnd('Lock Project end');

    return lockProjectSuccess(projectId);
};
