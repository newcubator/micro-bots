import { BirthdayType } from "./types/birthday-bot-types";

export const createChannelName = (birthday: BirthdayType) => {
  return `birthday-${birthday.firstname.toLowerCase()}-${birthday.lastname.toLowerCase()}`;
};
