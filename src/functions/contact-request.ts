import { decode, ParsedUrlQuery } from "querystring";
import { getBrevoContactByEmail } from "../brevo/contacts";
import { HttpRequest, HttpResponse } from "../http/types";
import { createContact, findContactByEmail } from "../moco/contacts";
import { slackClient } from "../clients/slack";

type ContactRequest = ParsedUrlQuery & {
  FIRSTNAME?: string;
  LASTNAME?: string;
  ORGANIZATION_OR_COMPANY_NAME?: string;
  EMAIL?: string;
  LANDLINE_NUMBER?: string;
  LANDLINE_NUMBER__COUNTRY_CODE?: string;
  ANFRAGETHEMA?: string;
  PROJEKTANFRAGE?: string;
  PLANUNG_ZEITHORIZONT?: string;
  BUDGET?: string;
  FUNKTIONEN?: string;
  PROJEKTZIEL?: string;
  BESTEHENDE_LOESUNG?: string;
  SONSTIGE_INFOS?: string;
  QUELLSEITE?: string;
  KONTAKTSEITE?: string;
};

const ALLOWED_ORIGINS = new Set([
  "https://newcubator.com",
  "https://www.newcubator.com",
  "https://newcubator-website.hubertus.newcubator.com",
  "http://127.0.0.1:4321",
  "http://localhost:4321",
]);

const value = (request: ContactRequest, key: keyof ContactRequest) => {
  const entry = request[key];
  return typeof entry === "string" ? entry.trim() : "";
};

const formatPhone = (request: ContactRequest) => {
  const phone = value(request, "LANDLINE_NUMBER").replace(/\D/g, "");
  const countryCode = value(request, "LANDLINE_NUMBER__COUNTRY_CODE").replace(/\D/g, "");
  if (!phone) return undefined;
  return `+${countryCode || "49"} ${phone}`;
};

const inquiryInfo = (request: ContactRequest) =>
  [
    ["Unternehmen / Organisation", value(request, "ORGANIZATION_OR_COMPANY_NAME")],
    ["Anfragethema", value(request, "ANFRAGETHEMA")],
    ["Projektanfrage", value(request, "PROJEKTANFRAGE")],
    ["Planung / Zeithorizont", value(request, "PLANUNG_ZEITHORIZONT")],
    ["Budget", value(request, "BUDGET")],
    ["Funktionen", value(request, "FUNKTIONEN")],
    ["Projektziel", value(request, "PROJEKTZIEL")],
    ["Bestehende Lösung", value(request, "BESTEHENDE_LOESUNG")],
    ["Sonstige Infos", value(request, "SONSTIGE_INFOS")],
    ["Quellseite", value(request, "QUELLSEITE")],
    ["Kontaktseite", value(request, "KONTAKTSEITE")],
  ]
    .filter(([, fieldValue]) => fieldValue)
    .map(([label, fieldValue]) => `${label}: ${fieldValue}`)
    .join("\n");

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  Vary: "Origin",
});

const integrationError = (origin: string, step: string, error: unknown): HttpResponse => {
  console.error(
    JSON.stringify({
      service: "micro-bots",
      status: "contact_request_failed",
      step,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  return {
    statusCode: 502,
    body: JSON.stringify({ error: `${step}_failed` }),
    headers: corsHeaders(origin),
  };
};

export const handler = async (event: HttpRequest): Promise<HttpResponse> => {
  const origin = event.origin ?? "";
  if (!ALLOWED_ORIGINS.has(origin)) {
    return { statusCode: 403, body: JSON.stringify({ error: "Origin not allowed" }) };
  }

  const request = decode(event.body ?? "") as ContactRequest;
  const firstname = value(request, "FIRSTNAME");
  const lastname = value(request, "LASTNAME");
  const email = value(request, "EMAIL").toLowerCase();
  if (!firstname || !lastname || !email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "FIRSTNAME, LASTNAME and EMAIL are required" }),
      headers: corsHeaders(origin),
    };
  }

  let brevoContact;
  try {
    brevoContact = await getBrevoContactByEmail(email);
  } catch (error) {
    return integrationError(origin, "brevo_contact_lookup", error);
  }

  let mocoContact;
  try {
    const existingMocoContact = await findContactByEmail(email);
    mocoContact =
      existingMocoContact ??
      (await createContact({
        firstname,
        lastname,
        gender: "U",
        work_email: email,
        work_phone: formatPhone(request),
        info: inquiryInfo(request),
      }));
  } catch (error) {
    return integrationError(origin, "moco_contact", error);
  }

  const salesChannel = process.env.SALES_CHANNEL;
  if (!salesChannel) throw new Error("SALES_CHANNEL is missing");

  const mocoUrl = `https://newcubator.mocoapp.com/contacts/people/${mocoContact.id}`;
  const brevoUrl = `https://app.brevo.com/contact/index/${brevoContact.id}`;
  const organization = value(request, "ORGANIZATION_OR_COMPANY_NAME");
  const topic = value(request, "ANFRAGETHEMA");
  const projectRequest = value(request, "PROJEKTANFRAGE");
  const planning = value(request, "PLANUNG_ZEITHORIZONT");
  const budget = value(request, "BUDGET");

  try {
    await slackClient.chat.postMessage({
      channel: salesChannel,
      text: [
        `Neue Website-Anfrage von ${firstname} ${lastname}${organization ? ` (${organization})` : ""}`,
        `E-Mail: ${email}`,
        topic ? `Thema: ${topic}` : "",
        projectRequest ? `Projekt: ${projectRequest}` : "",
        planning ? `Planung: ${planning}` : "",
        budget ? `Budget: ${budget}` : "",
        `<${mocoUrl}|Kontakt in Moco> · <${brevoUrl}|Kontakt in Brevo>`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (error) {
    return integrationError(origin, "slack_notification", error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ mocoUrl, brevoUrl }),
    headers: corsHeaders(origin),
  };
};
