import {WorkloadType} from "../types/workload-types";
import dayjs from "dayjs";

const project_employees = ["Simon", "Hendrik", "Lucas", "Sven", "Tim", "Jan", "Umut", "Rahmi", "Adrian"]

export const createSlackResponseWorkload = (workload: WorkloadType, duration: number, from: string, to: string) => {

  let response
  if (workload.percentage < 75) {
    response = `*Du hast insgesamt ${workload.workedHours} Stunden erfasst und damit eine Auslastung von ` +
      `${workload.percentage.toFixed(0)}%*\nHast du deine Zeiten alle richtig erfasst? Guck mal hier nach <https://newcubator.mocoapp.com/activities|Moco>`;
  } else if (workload.percentage > 80) {
    response = `*Du hast insgesamt ${workload.workedHours} Stunden erfasst und damit eine Auslastung ` +
      `von ${workload.percentage.toFixed(0)}%*\nDu hast eine hohe Auslastung, schau doch mal ob du deine Zeit für etwas anderes nutzen kannst.\n` +
      `<https://gitlab.com/newcubator/book/-/issues|Book>, <https://gitlab.com/newcubator/newcubator-homepage/homepage|Homepage>, ` +
      `<https://newcubator.com/blog|Blog>, <https://gitlab.com/newcubator/devsquad/-/issues|DevSquad>`;
  } else {
    response = `Du hast in den letzten ${duration} Tagen insgesamt ${workload.workedHours} Stunden erfasst und damit eine Auslastung von ${workload.percentage.toFixed(0)}%.`;
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

  const projectEmployeesArray = workload.filter((workloadElement) => project_employees.find(s => s === workloadElement?.user.firstname))
  const nonProjectEmployeesArray = workload.filter((workloadElement) => !project_employees.find(s => s === workloadElement?.user.firstname))

  responseEmployeeArray.push({
      type: "section",
      text: {
        type: "plain_text",
        text: "Projektmitarbeiter"
      }
    },
    createFields(projectEmployeesArray, true),
    {
      type: "section",
      text: {
        type: "plain_text",
        text: "nicht-Projektmitarbeiter"
      }
    },
    createFields(nonProjectEmployeesArray, false))

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

function createFields(employeeArray: WorkloadType[], projectEmployees: boolean) {
  let responseEmployeeArray = []
  let employeesOverSeventyFive = 0
  let employeesWorked = employeeArray.length

  for (const workloadElement of employeeArray) {
    if (!workloadElement) continue;

    let percentageText: string
    if (workloadElement.percentage != null && workloadElement.percentage >= 75) {
      employeesOverSeventyFive++
      percentageText = ":+1:"
    } else if (workloadElement.percentage != null) {
      percentageText = ":-1:"
    } else if (workloadElement.holidays >= 5) {
      employeesWorked--
      percentageText = ":palm_tree:"
    } else {
      employeesWorked--
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
    }, {
      type: "divider"
    })
  }
  if (projectEmployees) {
    responseEmployeeArray.unshift({
      type: "section",
      text: {
        type: "plain_text",
        text: `Mitarbeiter über 75%: ${employeesOverSeventyFive}/${employeesWorked}`
      }
    }, {
      type: "divider"
    })
  }
  return responseEmployeeArray;
}
