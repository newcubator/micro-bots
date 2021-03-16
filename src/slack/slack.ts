import { WebClient } from '@slack/web-api';

const SLACK_TOKEN = process.env.SLACK_TOKEN;

if (typeof SLACK_TOKEN === 'undefined') {
    throw new Error('Slack token missing');
}

export const slack = new WebClient(SLACK_TOKEN);
