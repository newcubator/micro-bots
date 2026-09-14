import { getBrevoContactByEmail } from "../brevo/contacts";
import { createContact, findContactByEmail } from "../moco/contacts";
import { slackClient } from "../clients/slack";
import { handler } from "./contact-request";

jest.mock("../brevo/contacts");
jest.mock("../moco/contacts");
jest.mock("../clients/slack", () => ({
  slackClient: { chat: { postMessage: jest.fn() } },
}));

const getBrevoContactByEmailMock = getBrevoContactByEmail as jest.Mock;
const findContactByEmailMock = findContactByEmail as jest.Mock;
const createContactMock = createContact as jest.Mock;
const slackPostMessageMock = slackClient.chat.postMessage as jest.Mock;

const body = new URLSearchParams({
  FIRSTNAME: "Ada",
  LASTNAME: "Lovelace",
  ORGANIZATION_OR_COMPANY_NAME: "Analytical Engines GmbH",
  EMAIL: "ada@example.com",
  LANDLINE_NUMBER: "15123456789",
  LANDLINE_NUMBER__COUNTRY_CODE: "+49",
  ANFRAGETHEMA: "Web-App Entwicklung",
  PROJEKTANFRAGE: "Web-App Entwicklung",
  PLANUNG_ZEITHORIZONT: "In den nächsten 3 Monaten",
  BUDGET: "25.000–50.000 €",
  FUNKTIONEN: "Schnittstellen / API-Integration",
  PROJEKTZIEL: "Manuelle Arbeit reduzieren",
  BESTEHENDE_LOESUNG: "Ja, sie soll erweitert werden",
  SONSTIGE_INFOS: "Bitte zeitnah melden.",
  QUELLSEITE: "/leistungen/",
  KONTAKTSEITE: "/kontakt/",
}).toString();

describe("contact request", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SALES_CHANNEL = "C-SALES";
    getBrevoContactByEmailMock.mockResolvedValue({ id: 42, email: "ada@example.com" });
    findContactByEmailMock.mockResolvedValue(undefined);
    createContactMock.mockResolvedValue({ id: 23, work_email: "ada@example.com" });
    slackPostMessageMock.mockResolvedValue({ ok: true });
  });

  it("creates a Moco contact and posts both contact links to Sales", async () => {
    const response = await handler({ body, origin: "https://www.newcubator.com" });

    expect(response).toEqual({
      statusCode: 201,
      body: JSON.stringify({
        mocoUrl: "https://newcubator.mocoapp.com/contacts/people/23",
        brevoUrl: "https://app.brevo.com/contact/index/42",
      }),
      headers: {
        "Access-Control-Allow-Origin": "https://www.newcubator.com",
        Vary: "Origin",
      },
    });
    expect(getBrevoContactByEmailMock).toHaveBeenCalledWith("ada@example.com");
    expect(findContactByEmailMock).toHaveBeenCalledWith("ada@example.com");
    expect(createContactMock).toHaveBeenCalledWith({
      firstname: "Ada",
      lastname: "Lovelace",
      gender: "U",
      work_email: "ada@example.com",
      work_phone: "+49 15123456789",
      info: expect.stringContaining("Projektziel: Manuelle Arbeit reduzieren"),
    });
    expect(slackPostMessageMock).toHaveBeenCalledWith({
      channel: "C-SALES",
      text: expect.stringContaining(
        "<https://newcubator.mocoapp.com/contacts/people/23|Kontakt in Moco> · <https://app.brevo.com/contact/index/42|Kontakt in Brevo>",
      ),
    });
  });

  it("reuses an existing Moco contact with the same email", async () => {
    findContactByEmailMock.mockResolvedValue({ id: 99, work_email: "ada@example.com" });

    await handler({ body, origin: "https://newcubator-website.hubertus.newcubator.com" });

    expect(createContactMock).not.toHaveBeenCalled();
    expect(slackPostMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining("contacts/people/99") }),
    );
  });

  it("rejects unknown origins", async () => {
    const response = await handler({ body, origin: "https://example.com" });

    expect(response.statusCode).toBe(403);
    expect(getBrevoContactByEmailMock).not.toHaveBeenCalled();
  });

  it("rejects requests without required contact fields", async () => {
    const response = await handler({ body: "EMAIL=ada%40example.com", origin: "http://127.0.0.1:4321" });

    expect(response.statusCode).toBe(400);
    expect(getBrevoContactByEmailMock).not.toHaveBeenCalled();
  });
});
