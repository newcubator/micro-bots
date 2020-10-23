import {MocoActivityResponse, MocoEmploymentsResponse, MocoSchedulesResponse} from "./types/moco-types";
import dayjs from "dayjs";
import {DayObjectType, WorkloadType} from "./types/workload-types";

export function calculateWorkload(duration: number) {
  return (input: [MocoSchedulesResponse, MocoEmploymentsResponse, MocoActivityResponse]): WorkloadType => {
    const [schedules, employments, activities] = input;

    if (employments.data.length == 0) return;

    const activitiesMap = activities.data.map(activity => {
      return {id: activity.id, date: activity.date, hours: activity.hours}
    })

    const pattern = employments.data[0].pattern;

    let expectedSum = 0;
    let workedSum = 0;
    let holidays = 0;
    let days: DayObjectType[] = []

    for (let step = 1; step <= duration; step++) {
      const day = dayjs().subtract(step, 'day');
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
      const scheduled = schedules.data.find(schedule => schedule.date == dayString);
      if (scheduled) {
        if ((scheduled.assignment.name == "Urlaub" && !dayObject.weekend) || (scheduled.assignment.name == "Feiertag" && !dayObject.weekend)) {
          dayObject.holiday = true
          holidays++
        }
      }

      if (!dayObject.weekend && !dayObject.holiday) {
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

    return {
      user: employments.data[0].user,
      expectedHours: expectedSum,
      holidays: holidays,
      workedHours: workedSum,
      days: days
    };
  }
}
