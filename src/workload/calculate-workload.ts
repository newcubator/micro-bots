import {MocoActivity, MocoEmployment, MocoSchedule} from "../types/moco-types";
import dayjs from "dayjs";
import {DayObjectType, WorkloadType} from "../types/workload-types";

export function calculateWorkload(from: string, to: string, activities: MocoActivity[], employments: MocoEmployment[], schedules: MocoSchedule[]): WorkloadType {

  if (employments.length == 0) return;

  const activitiesMap = activities.map(activity => {
    return {id: activity.id, date: activity.date, hours: activity.hours}
  })

  const pattern = employments[0].pattern;

  let expectedSum = 0;
  let workedSum = 0;
  let holidays = 0;
  let notPlanned = 0;
  let days: DayObjectType[] = []

  for (let step = 0; step <= dayjs(to).diff(dayjs(from), "day"); step++) {
    const day = dayjs(to).subtract(step, 'day');
    const dayString = day.format('YYYY-MM-DD');
    let dayObject: DayObjectType = {
      day: dayString,
      expectedHours: 0,
      worked: 0
    }

    // don't expect people to work on weekends
    if (day.get('day') == 0 || day.get('day') == 6) {
      dayObject.weekend = true
    }

    // ignore scheduled absence days
    const scheduled = schedules.find(schedule => schedule.date == dayString);
    if (scheduled) {
      if (scheduled.assignment.name == "Nicht planbar") {
        dayObject.notPlanned = true
        notPlanned++
      }
      if ((scheduled.assignment.name == "Urlaub" && !dayObject.weekend) || (scheduled.assignment.name == "Feiertag" && !dayObject.weekend)) {
        dayObject.holiday = true
        holidays++
      }
    }

    if (!dayObject.weekend && !dayObject.holiday && !dayObject.notPlanned) {
      let expected = pattern.am[day.get('day') - 1] + pattern.pm[day.get('day') - 1]
      dayObject.expectedHours = expected;
      expectedSum += expected
    }

    let workedActivities = activitiesMap.filter(activity => activity.date == dayString)
    if (workedActivities) {
      let workedHours = 0
      workedActivities.forEach((activity) => {
        workedHours += activity.hours
      })
      dayObject.worked = workedHours
      workedSum += workedHours
    }
    days.push(dayObject)
  }

  let percentage: number
  if (expectedSum == 0 && workedSum == 0) {
    percentage = null;
  } else {
    percentage = 100 / expectedSum * workedSum;
  }

  return {
    user: employments[0].user,
    expectedHours: expectedSum,
    holidays: holidays,
    workedHours: workedSum,
    notPlanned: notPlanned,
    days: days,
    percentage: percentage
  };
}
