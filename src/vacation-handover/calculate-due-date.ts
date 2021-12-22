import dayjs from "dayjs";
import { MocoEmployment } from "../moco/types/moco-types";
import { setUpBusinessTimes } from "./set-up-business-times";

export const calculateDueDate = (startDate: dayjs.Dayjs, employment: MocoEmployment) => {
  setUpBusinessTimes(employment);
  return startDate.subtractBusinessDays(1);
};
