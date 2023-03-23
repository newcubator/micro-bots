import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { changeMailRespondForUser, getMailSettingsForUser } from "../_shared/microsoft/mail";
import { getUsers as microsoftGetUsers } from "../_shared/microsoft/users";
import { getUsersWithVacation } from "../moco/vacation";
import { slackChatPostMessage } from "../slack/slack";
import { handler } from "./holiday-set-automatic-mail-replies";

jest.mock("../moco/vacation");
jest.mock("../_shared/microsoft/users");
jest.mock("../_shared/microsoft/mail");
jest.mock("../slack/slack");

const mockGetUsersWithVacation = getUsersWithVacation as unknown as jest.Mock;
const mockMicrosoftGetUsers = microsoftGetUsers as unknown as jest.Mock;
const mockMicrosoftGetMailSettingsForUser = getMailSettingsForUser as unknown as jest.Mock;
const mockMicrosoftChangeMailRespondForUser = changeMailRespondForUser as unknown as jest.Mock;
const mockSlackChatPostMessage = slackChatPostMessage as unknown as jest.Mock;

dayjs.extend(utc);

describe("HolidaySetAutomaticMailReplies", () => {
  it("should set a mail reply for user", async () => {
    const oldHoliday = dayjs().subtract(3, "day");
    const startHoliday = dayjs().add(1, "day");
    const endHoliday = dayjs().add(4, "day");
    const availableDate = dayjs().add(5, "day").format("DD.MM.YYYY");

    mockGetUsersWithVacation.mockResolvedValueOnce([
      {
        user: {
          email: "MaxMustermann@email.de",
          custom_properties: {
            Standort: "Dortmund",
          },
        },
        dates: [oldHoliday.format("YYYY-MM-DD"), startHoliday.format("YYYY-MM-DD"), endHoliday.format("YYYY-MM-DD")],
        employment: null,
      },
    ]);

    mockMicrosoftGetUsers.mockResolvedValueOnce({
      value: [
        {
          mail: "MaxMustermann@email.de",
          id: "1234-5678-9012",
          displayName: "Max Mustermann",
        },
      ],
    });

    mockMicrosoftGetMailSettingsForUser.mockResolvedValueOnce({
      automaticRepliesSetting: {
        scheduledStartDateTime: {
          dateTime: dayjs(oldHoliday).utc().format(),
        },
      },
    });

    mockMicrosoftChangeMailRespondForUser.mockResolvedValueOnce({});
    mockSlackChatPostMessage.mockResolvedValueOnce({});

    await expect(handler()).resolves.toBeUndefined();

    expect(mockMicrosoftChangeMailRespondForUser.mock.calls.length).toBe(1);
    expect(mockMicrosoftChangeMailRespondForUser.mock.calls[0]).toEqual([
      "1234-5678-9012",
      '<html><body><div style="font-family:Calibri,Arial,Helvetica,sans-serif; font-size:12pt; color:rgb(0,0,0)">\n    Guten Tag,\n\n    Vielen Dank für Ihre Nachricht. Ich befinde mich aktuell im Urlaub und habe währenddessen keinen Zugriff auf meine Mails. \n    Aus Vertraulichkeitsgründen wird Ihre E-Mail nicht automatisch weitergeleitet. Ich bin ab dem ' +
        availableDate +
        ' wieder verfügbar. Bei dringenden Anliegen wenden Sie sich bitte an unser Büro unter \n    (<a href="mailto:info@newcubator.com">info@newcubator.com</a> / 0231-58687380)\n\n    Vielen Dank!\n\n    Mit freundlichen Grüßen\n\n    Max Mustermann\n    </div></body></html>',
      startHoliday.format("YYYY-MM-DD"),
      endHoliday.format("YYYY-MM-DD"),
    ]);
    expect(mockSlackChatPostMessage.mock.calls.length).toEqual(1);
    expect(mockSlackChatPostMessage.mock.calls[0]).toEqual([
      expect.stringContaining("Hab einen schönen Urlaub!"),
      "1111111",
      "Mail Bot",
      ":e-mail:",
    ]);
  });

  it("should return a useful message if nobody has holiday", async () => {
    mockGetUsersWithVacation.mockResolvedValueOnce([]);

    const result = await handler();

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual("Aktuell hat niemand Urlaub");
  });
});
