import { Dayjs } from "dayjs";
import { BirthdayType } from "./types/birthday-bot-types";

export const filterBirthdays = (users: BirthdayType[], ...searchDate: Dayjs[]): BirthdayType[] => {
  return users.filter(
    (user) => !!user.birthday && searchDate.some((date) => user.birthday.endsWith(date.format("MM-DD")))
  );
};
