import { EventBridgeEvent } from 'aws-lambda';
import axios from 'axios';
import { createMultipleUserSchedules, createUserSchedule } from '../moco/schedules';
import { MocoUserType } from '../moco/types/moco-types';
import { findUserBySlackCommand, getUsers } from '../moco/users';
import { SickNoteRequestedEvent } from '../slack/interaction-handler';
import { slackChatPostMessage } from '../slack/slack';

export const eventHandler = async (event: EventBridgeEvent<string, SickNoteRequestedEvent>) => {
    console.log(`Handling event ${JSON.stringify(event.detail)}`);
    const user: MocoUserType = await getUsers().then(findUserBySlackCommand({ user_id: event.detail.userId, user_name: event.detail.userName }));

    if(event.detail.forSingleDay){
        const response = createUserSchedule( new Date().toISOString().split('T')[0], user.id, 3, true, true, 'Krankheit', null, true);
        const slackResponse = slackChatPostMessage(`@${event.detail.userName} muss sich heute leider krank melden. Gut Besserung!`, process.env.GENERAL_CHANNEL, 'Health-Bot', '😷')
    } else {
        const startDate = new Date(event.detail.startDay);
        const endDate = new Date(event.detail.endDay);

        if (startDate > endDate) {
            console.log(
                await axios.post(event.detail.responseUrl, {
                    replace_original: 'true',
                    text: `Das Start-Datum darf nicht nach dem End-Datum liegen.`,
                }),
            );
            return;
        }


        const response = createMultipleUserSchedules(startDate, endDate, user.id, 3, true, true, 'Krankheit', null, true);
        const slackResponse = slackChatPostMessage(`@${event.detail.userName} muss wurde vom ${event.detail.startDay} bis zum ${event.detail.endDay} krankgeschrieben. Gute Besserung!`, process.env.GENERAL_CHANNEL, 'Krankschreibung', '😷')
    }


    await axios.post(event.detail.responseUrl, {
        replace_original: 'true',
        text: `Deine Krankmeldung wurde erfolgreich eingereicht! Gut Besserung!`,
    });

};
