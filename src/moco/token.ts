export const MOCO_TOKEN = process.env.MOCO_TOKEN;

if (typeof MOCO_TOKEN === 'undefined') {
    throw new Error('MOCO API key missing');
}
