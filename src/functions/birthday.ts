import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { closeBirthdayChannels } from "../birthday/close-birthday-channels";
import { createBirthdayChannels } from "../birthday/create-birthday-channels";
import { filterBirthdays } from "../birthday/filter-birthdays";
import { sendBirthdayReminder } from "../birthday/send-birthday-reminder";
import { BirthdayType } from "../birthday/types/birthday-bot-types";
import { MOCO_TOKEN } from "../moco/token";

const MOCO_URL = "https://newcubator.mocoapp.com/api/v1/users";
const LEAD_TIME = process.env.LEAD_TIME;

export const handler = async () => {
  const today = dayjs();
  const yesterday = today.subtract(1, "day");
  const birthdayDate = today.add(Number(LEAD_TIME), "day");

  const response = await axios.get(MOCO_URL, {
    headers: {
      Authorization: "Token token=" + MOCO_TOKEN,
    },
  });
  const users: BirthdayType[] = response.data as BirthdayType[];

  console.log(
    `Searching for birthdays from ${today.format("MM-DD")} to ${birthdayDate.format("MM-DD")} to open channel`,
  );
  const dateArray: Dayjs[] = [];
  let currentDate = today;
  while (currentDate <= birthdayDate) {
    dateArray.push(currentDate);
    currentDate = currentDate.add(1, "day");
  }
  await createBirthdayChannels(filterBirthdays(users, ...dateArray));

  console.log(`Searching for birthdays on the ${today.format("MM-DD")} to send reminder`);
  await sendBirthdayReminder(filterBirthdays(users, today));

  if (today.day() >= 2 && today.day() <= 5) {
    console.log(`Searching for birthdays on the ${yesterday.format("MM-DD")} to archive channel`);
    await closeBirthdayChannels(filterBirthdays(users, yesterday));
  } else if (today.day() === 1) {
    console.log(
      `Searching for birthdays on the ${yesterday.format("MM-DD")}, ${yesterday
        .subtract(1, "day")
        .format("MM-DD")}, ${yesterday.subtract(2, "day").format("MM-DD")} to archive channel`,
    );
    await closeBirthdayChannels(
      filterBirthdays(users, yesterday, yesterday.subtract(1, "day"), yesterday.subtract(2, "day")),
    );
  }
};
