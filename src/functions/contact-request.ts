import { APIGatewayEvent } from "aws-lambda";
import { SES, SendEmailRequest } from "@aws-sdk/client-ses";
import { decode, ParsedUrlQuery } from "querystring";

export interface ContactRequest extends ParsedUrlQuery {
  title: string;
  message: string;
  firstname: string;
  lastname: string;
  email: string;
}

const SOURCE = "info@newcubator.com";
const DESTINATIONS = ["info@newcubator.com"];

const ALLOWED_ORIGINS = ["https://newcubator.com", "http://localhost:8000", "http://localhost:6006"];

export const handler = async (event: APIGatewayEvent) => {
  const command: ContactRequest = decode(event.body) as ContactRequest;
  console.log(
    `Contact Request from ${command?.title} ${command.firstname} ${command.lastname} (${command.email}) with message: "${command.message}"`
  );

  const requestOrigin = event.headers?.["origin"];
  if (!requestOrigin || !ALLOWED_ORIGINS.includes(requestOrigin)) {
    return {
      statusCode: 405,
    };
  }

  const client = new SES({ region: "eu-central-1" });
  const emailRequest: SendEmailRequest = {
    Message: {
      Subject: {
        Data: `Kontaktanfrage von ${command.firstname} ${command.lastname}`,
        Charset: "utf8",
      },
      Body: {
        Text: {
          Data: `
Anrede: ${command?.title}
Vorname: ${command.firstname}
Nachname: ${command.lastname}
Email: ${command.email}
Nachricht: ${command.message}
                    `,
        },
      },
    },
    Source: SOURCE,
    Destination: {
      ToAddresses: DESTINATIONS,
    },
  };
  await client.sendEmail(emailRequest);

  console.log("Send contact request mail");

  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": requestOrigin,
    },
  };
};