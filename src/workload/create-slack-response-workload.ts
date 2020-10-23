import {WorkloadType} from "../types/workload-types";
import dayjs from "dayjs";

export const createSlackResponseWorkload = (workload: WorkloadType, duration: number, from: string, to: string) => {

  const percentage = 100 / workload.expectedHours * workload.workedHours;

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
  }
}

export const createSlackResponseWorkloadAll = (workload: WorkloadType[], duration: number) => {
  let responseEmployeeArray = []

  workload.sort((firstElement, secondElement) => firstElement.user.lastname.localeCompare(secondElement.user.lastname))

  for (const workloadElement of workload) {
    if (!workloadElement) continue;
    let percentage: number
    if (workloadElement.expectedHours == 0 && workloadElement.workedHours == 0) {
      percentage = null;
    } else {
      percentage = 100 / workloadElement.expectedHours * workloadElement.workedHours;
    }

    let percentageText: string
    if (percentage != null && percentage >= 75) {
      percentageText = ":+1:"
    } else if (percentage != null) {
      percentageText = ":-1:"
    } else if (workloadElement.holidays >= 5) {
      percentageText = ":palm_tree:"
    } else {
      percentageText = ":man-shrugging:"
    }
    responseEmployeeArray.push({
      type: "section",
      fields: [
        {
          type: "plain_text",
          text: `${workloadElement.user.firstname} ${workloadElement.user.lastname}`
        },
        {
          type: "plain_text",
          text: `${percentageText}`,
          emoji: true
        }
      ]
    })
    responseEmployeeArray.push({
      type: "divider"
    })
  }

  return {
    "blocks": [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": "Wöchentliche Auslastung"
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hallo <!channel>, hier ist eure Auslastung der letzten ${duration} Tage. Schaut doch bitte mal ob ihr alle eure Stunden richtig erfasst habt.`
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "fields": [
          {
            "type": "plain_text",
            "text": "Mitarbeiter*in",
            "emoji": true
          },
          {
            "type": "plain_text",
            "text": "Auslastung >= 75%",
            "emoji": true
          }
        ]
      },
      {
        "type": "divider"
      },
      ...responseEmployeeArray,
      {
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": "Für weitere Informationen zu eurer Auslastung könnt ihr den Befehl /workload nutzen."
          }
        ]
      }
    ]
  }
}
