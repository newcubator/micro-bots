import dayjs, { Dayjs } from 'dayjs';
import { MocoActivity, MocoEmployment, MocoSchedule } from '../moco/types/moco-types';
import { DayObjectType, WorkloadType } from '../moco/types/workload-types';

const DATE_FORMAT = 'YYYY-MM-DD';

const isWeekday = (day: Dayjs) => (day.get('day') > 0 && day.get('day') < 6);

const createDayRange = (from: Dayjs, to: Dayjs) => new Array(to.diff(from, 'day') + 1)
    .fill(from)
    .map((date, idx) => date.add(idx, 'day'));

const extractAbsenceHours = (schedules: MocoSchedule[], assignmentType?: string, day?: Dayjs) => {
    return schedules
        .filter((schedule: MocoSchedule) => !day || schedule.date === day.format(DATE_FORMAT))
        .filter((schedule: MocoSchedule) => !assignmentType || schedule.assignment.name === assignmentType)
        .reduce((sum, schedule: MocoSchedule) => sum + ((+schedule.am + +schedule.pm) * 4), 0);
};

// This function assumes that the pattern array always contains 5 entries, even if the employment ends in the middle of the week
const extractExpectedHours = (employment: MocoEmployment, day: Dayjs) => employment.pattern.am[day.get('day') - 1] + employment.pattern.pm[day.get('day') - 1];

export function calculateWorkload(from: string, to: string, activities: MocoActivity[], employments: MocoEmployment[], schedules: MocoSchedule[]): WorkloadType {

    if (!employments.length) {
        return;
    }

    return createDayRange(dayjs(from), dayjs(to))
        .filter(isWeekday)
        .map((day: Dayjs) => {
            const workedHours = activities
                .filter(activity => activity.date === day.format(DATE_FORMAT))
                .reduce((workedHours, activity) => workedHours + activity.hours, 0);

            const employment: MocoEmployment = employments
                .find(({ from, to }: MocoEmployment) =>
                    (!from || day.isSame(from) || day.isAfter(from)) && (!to || day.isSame(to) || day.isBefore(to)));

            const absenceHours = extractAbsenceHours(schedules, null, day);
            // not every time range has an employment; see Lucas Meurer from 28.12.20 - 03.01.21
            const scheduledHours = employment ? extractExpectedHours(employment, day) : 0;

            return {
                day: day.format(DATE_FORMAT),
                expectedHours: Math.max(scheduledHours - absenceHours, 0), // result can be below 0 for part time employees
                worked: workedHours,
                holidays: extractAbsenceHours(schedules, 'Feiertag', day),
                vacations: extractAbsenceHours(schedules, 'Urlaub', day),
                notPlannedHours: extractAbsenceHours(schedules, 'Nicht planbar', day),
                sick: extractAbsenceHours(schedules, 'Krankheit', day),
                absence: extractAbsenceHours(schedules, 'Abwesenheit', day),
            };
        })
        .reduce((workload: WorkloadType, dayObject: DayObjectType & { holidays: number, vacations: number, notPlannedHours: number, sick: number, absence: number }) => {
            const expectedHours = workload.expectedHours + dayObject.expectedHours;
            const workedHours = workload.workedHours + dayObject.worked;
            return {
                ...workload,
                expectedHours: expectedHours,
                workedHours: workedHours,
                percentage: !expectedHours ? 100 : Math.round(workedHours / expectedHours * 100), // expectedHours could be 0 which is not allowed in divisions
                days: [...workload.days, { day: dayObject.day, worked: dayObject.worked, expectedHours: dayObject.expectedHours }],
                absence: workload.absence + dayObject.absence,
                vacations: workload.vacations + dayObject.vacations,
                holidays: workload.holidays + dayObject.holidays,
                notPlanned: workload.notPlanned + dayObject.notPlannedHours,
                sick: workload.sick + dayObject.sick,
            };
        }, {
            user: employments[0].user,
            expectedHours: 0,
            workedHours: 0,
            days: [],
            absence: 0,
            holidays: 0,
            notPlanned: 0,
            sick: 0,
            vacations: 0,
            percentage: 1
        });
}
