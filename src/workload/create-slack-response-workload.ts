import dayjs, { Dayjs } from 'dayjs';
import { WorkloadType } from '../moco/types/workload-types';

const employeeNames = process.env.EMPLOYEE_NAMES ?? '';
const workloadPercentage: number = parseInt(process.env.WORKLOAD_PERCENTAGE) ?? 75;

const project_employees = employeeNames
    .split(',')
    .map((name: string) => name.trim());

export const createSlackResponseWorkload = (workload: WorkloadType, duration: number, from: string, to: string) => {

    let response;
    if (workload.percentage < workloadPercentage) {
        response = `*Du hast insgesamt ${workload.workedHours} Stunden erfasst und damit eine Auslastung von ` +
            `${workload.percentage.toFixed(0)}%*\nHast du deine Zeiten alle richtig erfasst? Guck mal hier nach <https://newcubator.mocoapp.com/activities|Moco>`;
    } else if (workload.percentage > workloadPercentage + 5) {
        response = `*Du hast insgesamt ${workload.workedHours} Stunden erfasst und damit eine Auslastung ` +
            `von ${workload.percentage.toFixed(0)}%*\nDu hast eine hohe Auslastung, schau doch mal ob du deine Zeit für etwas anderes nutzen kannst.\n` +
            `<https://gitlab.com/newcubator/book/-/issues|Book>, <https://gitlab.com/newcubator/newcubator-homepage/homepage|Homepage>, ` +
            `<https://newcubator.com/blog|Blog>, <https://gitlab.com/newcubator/devsquad/-/issues|DevSquad>`;
    } else {
        response = `Du hast in den letzten ${duration} Tagen insgesamt ${workload.workedHours} Stunden erfasst und damit eine Auslastung von ${workload.percentage.toFixed(0)}%.`;
    }

    return {
        'blocks': [
            {
                'type': 'section',
                'text': {
                    'type': 'mrkdwn',
                    'text': response
                }
            },
            {
                'type': 'context',
                'elements': [
                    {
                        'type': 'plain_text',
                        'text': `Zeitraum: ${dayjs(from).format('DD.MM.YYYY')} bis ${dayjs(to).format('DD.MM.YYYY')}`,
                        'emoji': true
                    },
                    {
                        'type': 'plain_text',
                        'text': `Urlaubstage/Feiertage: ${workload.holidays}`,
                        'emoji': true
                    }
                ]
            }
        ]
    };
};

export const createSlackResponseWorkloadAll = (workload: WorkloadType[], from: Dayjs, to: Dayjs) => {
    let responseEmployeeArray = [];

    workload.sort((firstElement, secondElement) => firstElement.user.lastname.localeCompare(secondElement.user.lastname));

    const projectEmployeesArray = workload.filter((workloadElement) => project_employees.find(s => s === workloadElement?.user.firstname));
    const nonProjectEmployeesArray = workload.filter((workloadElement) => !project_employees.find(s => s === workloadElement?.user.firstname));

    let projectEmployeesArrayBlocks = createFields(projectEmployeesArray);
    let nonProjectEmployeesArrayBlocks = createFields(nonProjectEmployeesArray);

    responseEmployeeArray.push(
        {
            type: 'section',
            fields: [{
                type: 'mrkdwn',
                text: '*Projektmitarbeiter*'
            }]
        },
        {
            'type': 'divider'
        },
        ...projectEmployeesArrayBlocks.content,
        {
            type: 'section',
            fields: [{
                type: 'mrkdwn',
                text: '*nicht-Projektmitarbeiter*'
            }]
        },
        {
            'type': 'divider'
        },
        ...nonProjectEmployeesArrayBlocks.content);

    return {
        'blocks': [
            {
                'type': 'header',
                'text': {
                    'type': 'plain_text',
                    'text': 'Wöchentliche Auslastung'
                }
            },
            {
                'type': 'section',
                'text': {
                    'type': 'mrkdwn',
                    'text': `Hallo <!channel>, hier ist eure Auslastung vom ${from.format('DD.MM.YYYY')} bis zum ${to.format('DD.MM.YYYY')}. ` +
                        `Schaut doch bitte mal ob ihr alle eure Stunden richtig erfasst habt.`
                }
            },
            ...projectEmployeesArrayBlocks.headline,
            {
                'type': 'section',
                'fields': [
                    {
                        'type': 'mrkdwn',
                        'text': '*Mitarbeitende*',
                    },
                    {
                        'type': 'mrkdwn',
                        'text': `*Auslastung >= ${workloadPercentage}%*`,
                    }
                ]
            },
            {
                'type': 'divider'
            },
            ...responseEmployeeArray,
            {
                'type': 'context',
                'elements': [
                    {
                        'type': 'mrkdwn',
                        'text': 'Für weitere Informationen zu eurer Auslastung könnt ihr den Befehl /workload nutzen.'
                    }
                ]
            }
        ]
    };
};

function createFields(employeeArray: WorkloadType[]) {
    let headline;
    let responseEmployeeArray = [];
    let employeesOverSeventyFive = 0;
    let employeesWorked = employeeArray.length;

    for (const workloadElement of employeeArray) {
        if (!workloadElement) {
            continue;
        }

        let percentageText: string;
        if (workloadElement.percentage != null && workloadElement.percentage >= workloadPercentage) {
            employeesOverSeventyFive++;
            percentageText = ':+1:';
        } else if (workloadElement.percentage != null) {
            percentageText = ':-1:';
        } else if (workloadElement.holidays >= 5) {
            employeesWorked--;
            percentageText = ':palm_tree:';
        } else {
            employeesWorked--;
            percentageText = ':man-shrugging:';
        }
        responseEmployeeArray.push({
            type: 'section',
            fields: [
                {
                    type: 'plain_text',
                    text: `${workloadElement.user.firstname} ${workloadElement.user.lastname}`
                },
                {
                    type: 'plain_text',
                    text: `${percentageText}`,
                    emoji: true
                }
            ]
        }, {
            type: 'divider'
        });
    }

    headline = [{
        type: 'section',
        fields: [
            {
                type: 'plain_text',
                text: `Projektmitarbeiter über ${workloadPercentage}%: ${employeesOverSeventyFive}/${employeesWorked}`
            }
        ]
    },
        {
            'type': 'section',
            'text': {
                'type': 'plain_text',
                'text': ' '
            }
        }
    ];

    return {
        headline: headline,
        content: responseEmployeeArray
    };
}
