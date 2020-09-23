import { APIGatewayEvent, Context } from 'aws-lambda';
import dayjs from 'dayjs';
import { decode } from 'querystring';
import {  getActivities } from './moco/activities';
import { getUserEmployments } from './moco/planningEntries';
import { getSchedules } from './moco/schedules';
import { findUserBySlackCommand, getUsers, User } from './moco/users';
import { Command } from './slack/command';
import AWSXRay from 'aws-xray-sdk';
import http from 'http';
import https from 'https';

AWSXRay.captureHTTPsGlobal(http, true);
AWSXRay.captureHTTPsGlobal(https, true);


const DEFAULT_DURATION = 21;

export async function handler(event: APIGatewayEvent, context: Context) {
  const command: Command = decode(event.body) as Command;
  const userPromise: Promise<User> = getUsers()
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

  const workloadPromise = Promise.all([
      getSchedules(from, to, user.id),
      getUserEmployments(from, to, user.id),
      getActivities(from, to, user.id)
  ]).then(calculateWorkload(duration))


  const workload = await workloadPromise;
  console.info(`worked: ${workload.workedHours}, expected: ${workload.expectedHours}`);

  const percentage = 100 / workload.expectedHours * workload.workedHours;
  console.info(`percentage: ${percentage}`);


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
  }else{
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
              "text": `Urlaubstage: ${workload.holidays}`,
              "emoji": true
            }
          ]
        }
      ]
    })
  };
}

/**
 * Checks for each day if it was a workday and if so adds up the users planned
 * hours of that day.
 */
export function calculateWorkload(duration: number) {
  return (input) => {
    const [schedules, employments, activities] = input;
    const activitiesMap = activities.map(activity => {return {id: activity.id, date:activity.date, hours:activity.hours}})
    console.debug('schedules',schedules.data);
    console.debug('employments',employments.data);
    console.debug('activities',activitiesMap);

    const pattern = employments.data[0].pattern;
    console.info(`Working pattern: ${JSON.stringify(pattern)}`);

    let expectedSum = 0;
    let workedSum = 0;
    let holidays = 0;
    let days: DayObjectProps[] = []

    interface DayObjectProps{
      day: string;
      expectedHours: number;
      worked: number;
      holiday?: boolean;
      weekend?: boolean;
    }

    for (let step = 1; step <= duration; step++) {
      const day = dayjs().subtract(step, 'day');
      const dayString = day.format('YYYY-MM-DD');
      let dayObject: DayObjectProps = {
        day: dayString,
        expectedHours: 0,
        worked: 0
      }

      // don't expect people to work on weekends
      if (day.get('day') == 0 || day.get('day') == 6) {
        dayObject.weekend = true
      }

      // ignore scheduled absence days
      const scheduled = schedules.data.find(schedule => schedule.date == dayString);
      if (scheduled) {
        if(scheduled.assignment.name == "Urlaub") {
          dayObject.holiday = true
          holidays++
        };
      }

      if(!dayObject.weekend && !dayObject.holiday){
        let expected = pattern.am[day.get('day') - 1] + pattern.pm[day.get('day') - 1]
        dayObject.expectedHours = expected;
        expectedSum += expected
      }

      let workedActivities = activitiesMap.filter(activity => activity.date == dayString)
      if(workedActivities){
        let workedHours = 0
        workedActivities.forEach((activity) => {
          workedHours += activity.hours
        })
        dayObject.worked = workedHours
        workedSum += workedHours
      }
      days.push(dayObject)
    }

    console.log(days)
    return {
      expectedHours: expectedSum,
      holidays: holidays,
      workedHours: workedSum,
      days: days
    };
  }
}
