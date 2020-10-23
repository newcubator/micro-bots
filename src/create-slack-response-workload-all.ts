import {WorkloadType} from "./types/workload-types";

export const createSlackResponseWorkloadAll = (workload: WorkloadType[]) => {
  let responseEmployeeArray = []

  workload.sort((firstElement, secondElement) => firstElement.user.lastname.localeCompare(secondElement.user.lastname))

  for (const workloadElement of workload) {
    if (!workloadElement) continue;
    const percentage = 100 / workloadElement.expectedHours * workloadElement.workedHours;
    responseEmployeeArray.push({
      type: "section",
      fields: [
        {
          type: "plain_text",
          text: `${workloadElement.user.firstname} ${workloadElement.user.lastname}`
        },
        {
          type: "plain_text",
          text: `${percentage >= 75 ? ":+1:" : ":-1:"}`,
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
          "text": "Hallo <!channel>, hier ist eure wöchentliche Auslastung. Schaut doch bitte mal ob ihr alle eure Stunden richtig erfasst habt."
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
