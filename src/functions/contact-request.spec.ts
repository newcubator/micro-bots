import { APIGatewayEvent, APIGatewayProxyEventHeaders } from "aws-lambda";

const sendEmail = jest.fn();
jest.mock("@aws-sdk/client-ses", () => ({
  SES: jest.fn().mockImplementation(() => ({
    sendEmail,
  })),
}));
import { handler } from "./contact-request";

describe("ContactRequestTest", () => {
  beforeEach(() => {
    sendEmail.mockReset();
  });

  it("should send contact form", async () => {
    await handler({
      body: new URLSearchParams({
        title: "Mr.",
        name: "Max Mustermann",
        email: "max-musterann@example.com",
        page: "https://newcubator.com/",
        message: "Ich hätte gerne ein Web App",
      }).toString(),
      headers: {
        origin: "https://newcubator.com",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent);

    expect(sendEmail).toHaveBeenCalledWith({
      Destination: {
        ToAddresses: ["info@newcubator.com"],
      },
      Message: {
        Body: {
          Text: {
            Data: `
Anrede: Mr.
Name: Max Mustermann
Email: max-musterann@example.com
Nachricht: Ich hätte gerne ein Web App
Seite: https://newcubator.com/
                    `,
          },
        },
        Subject: {
          Charset: "utf8",
          Data: "Kontaktanfrage von Max Mustermann",
        },
      },
      Source: "info@newcubator.com",
    });
  });

  it("should send contact form without message and page", async () => {
    await handler({
      body: new URLSearchParams({
        title: "Mr.",
        name: "Max Mustermann",
        email: "max-musterann@example.com",
      }).toString(),
      headers: {
        origin: "https://newcubator.com",
      } as APIGatewayProxyEventHeaders,
    } as APIGatewayEvent);

    expect(sendEmail).toHaveBeenCalledWith({
      Destination: {
        ToAddresses: ["info@newcubator.com"],
      },
      Message: {
        Body: {
          Text: {
            Data: `
Anrede: Mr.
Name: Max Mustermann
Email: max-musterann@example.com
Nachricht: undefined
Seite: undefined
                    `,
          },
        },
        Subject: {
          Charset: "utf8",
          Data: "Kontaktanfrage von Max Mustermann",
        },
      },
      Source: "info@newcubator.com",
    });
  });
});
