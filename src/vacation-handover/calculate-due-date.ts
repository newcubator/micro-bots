import dayjs from "dayjs";
import { MocoEmployment } from "../moco/types/moco-types";

export const calculateDueDate = (startDate: dayjs.Dayjs, employment: MocoEmployment) => {
  let dueDate = startDate.subtract(1, "day");
  let workdays = employment.pattern.am.map((val, i) => val + employment.pattern.pm[i]);

  while (workdays[dueDate.day() - 1] === 0 || dueDate.day() === 0 || dueDate.day() === 6) {
    dueDate = dueDate.subtract(1, "day");
  }

  return dueDate;
};
