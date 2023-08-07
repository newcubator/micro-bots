import { APIGatewayEvent, APIGatewayProxyEventHeaders } from "aws-lambda";
import { encode } from "querystring";
import { handler } from "./fast-apply";

describe("FastApply", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send an email with the aquired data", async () => {
    const consoleLog = console.log;
    console.log = jest.fn();
    const headers = [];
    headers["origin"] = "http://localhost:8000";
    const event = {
      body: encode({ name: "Fake Name", email: "fake@email.de", message: "Fake Nachricht mit Bewerbung" }),
      headers: headers as unknown as APIGatewayProxyEventHeaders,
    };
    const result = await handler(event as APIGatewayEvent);
    expect(result).toEqual({
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:8000",
      },
      statusCode: 201,
    });
    expect(console.log).toHaveBeenNthCalledWith(
      1,
      'Contact Request from Fake Name (fake@email.de) with message: "Fake Nachricht mit Bewerbung"',
    );
    expect(console.log).toHaveBeenNthCalledWith(2, "Send contact request mail");
    console.log = consoleLog;
  });
});
