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

  const brevoContact = await getBrevoContactByEmail(email);
  const existingMocoContact = await findContactByEmail(email);
  const mocoContact =
    existingMocoContact ??
    (await createContact({
      firstname,
      lastname,
      gender: "U",
      work_email: email,
      work_phone: formatPhone(request),
      info: inquiryInfo(request),
    }));

  const salesChannel = process.env.SALES_CHANNEL;
  if (!salesChannel) throw new Error("SALES_CHANNEL is missing");

  const mocoUrl = `https://newcubator.mocoapp.com/contacts/people/${mocoContact.id}`;
  const brevoUrl = `https://app.brevo.com/contact/index/${brevoContact.id}`;
  const organization = value(request, "ORGANIZATION_OR_COMPANY_NAME");
  const topic = value(request, "ANFRAGETHEMA");
  const projectRequest = value(request, "PROJEKTANFRAGE");
  const planning = value(request, "PLANUNG_ZEITHORIZONT");
  const budget = value(request, "BUDGET");

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

  return {
    statusCode: 201,
    body: JSON.stringify({ mocoUrl, brevoUrl }),
    headers: corsHeaders(origin),
  };
};
