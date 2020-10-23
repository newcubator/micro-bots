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
// import AWSXRay from 'aws-xray-sdk';
// import http from 'http';
// import https from 'https';
//
// AWSXRay.captureHTTPsGlobal(http, true);
// AWSXRay.captureHTTPsGlobal(https, true);


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
  const to = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
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
  ]).then(calculateWorkload(duration))


  const workload = await workloadPromise;
  console.info(`worked: ${workload.workedHours}, expected: ${workload.expectedHours}`);

  const percentage = 100 / workload.expectedHours * workload.workedHours;
  console.info(`percentage: ${percentage}`);

  console.log(workload)

  // -75 Überprüfe
  // 75-80 Go on
  // 80+ Seh mal
  //
  // * Book / Okr https://gitlab.com/newcubator/book/-/issues
  // * Homepage https://gitlab.com/newcubator/newcubator-homepage/homepage
  // * Blog Post https://newcubator.com/blog
  // * Was kleineres im DevSqaud vorbereiten https://gitlab.com/newcubator/devsquad/-/issues

  let response
  if (percentage < 75) {
    response = `*Du hast insgesamt ${workload.workedHours} Stunden erfasst und damit eine Auslastung von ` +
      `${percentage.toFixed(0)}%*\nHast du deine Zeiten alle richtig erfasst? Guck mal hier nach <https://newcubator.mocoapp.com/activities|Moco>`;
  } else if (percentage > 80) {
    response = `*Du hast insgesamt ${workload.workedHours} Stunden erfasst und damit eine Auslastung ` +
      `von ${percentage.toFixed(0)}%*\nDu hast eine hohe Auslastung, schau doch mal ob du deine Zeit für etwas anderes nutzen kannst.\n` +
      `<https://gitlab.com/newcubator/book/-/issues|Book>, <https://gitlab.com/newcubator/newcubator-homepage/homepage|Homepage>, ` +
      `<https://newcubator.com/blog|Blog>, <https://gitlab.com/newcubator/devsquad/-/issues|DevSquad>`;
  } else {
    response = `Du hast in den letzten ${duration} Tagen insgesamt ${workload.workedHours} Stunden erfasst und damit eine Auslastung von ${percentage.toFixed(0)}%.`;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": response
          }
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "plain_text",
              "text": `Zeitraum: ${dayjs(from).format('DD.MM.YYYY')} bis ${dayjs(to).format('DD.MM.YYYY')}`,
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": `Urlaubstage/Feiertage: ${workload.holidays}`,
              "emoji": true
            }
          ]
        }
      ]
    })
  };
}
