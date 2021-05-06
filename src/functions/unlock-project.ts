import { APIGatewayEvent } from 'aws-lambda';
import { decode } from 'querystring';
import {
    lockUnlockProjectErrorNoProjectFound,
    lockUnlockProjectErrorNoProjectId,
    unlockProjectSuccess
} from '../lock-project/createSlackResponses';
import { getProject, putProjectContract } from '../moco/projects';
import { SlackCommandType } from '../slack/types/slack-types';

export const handler = async (event: APIGatewayEvent) => {
    const command: SlackCommandType = decode(event.body) as SlackCommandType;
    const projectId = command.text?.trim();

    if (projectId === undefined) {
        return lockUnlockProjectErrorNoProjectId();
    }

    const project = await getProject(projectId);

    if (!project) {
        return lockUnlockProjectErrorNoProjectFound();
    }

    await Promise.all(project.contracts.map(contract => putProjectContract(projectId, {
        ...contract,
        active: true
    })));

    return unlockProjectSuccess(projectId);
};
