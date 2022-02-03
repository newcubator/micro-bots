import { APIGatewayEvent } from "aws-lambda";
import { SES, SendEmailRequest } from "@aws-sdk/client-ses";
import { decode, ParsedUrlQuery } from "querystring";

export interface FastApply extends ParsedUrlQuery {
  message: string;
  name: string;
  email: string;
}

const SOURCE = "info@newcubator.com";
const DESTINATIONS = ["info@newcubator.com"];

const ALLOWED_ORIGINS = ["https://newcubator.com", "http://localhost:8000", "http://localhost:6006"];

export const handler = async (event: APIGatewayEvent) => {
  const command: FastApply = decode(event.body) as FastApply;
  console.log(`Contact Request from ${command.name} (${command.email}) with message: "${command.message}"`);

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
        Data: `Kontaktanfrage von ${command.name}`,
        Charset: "utf8",
      },
      Body: {
        Text: {
          Data: `
Name: ${command.name}
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
