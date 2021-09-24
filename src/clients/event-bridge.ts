import { EventBridgeClient, PutEventsCommandOutput, PutEventsCommand } from "@aws-sdk/client-eventbridge";

const AWS_REGION = process.env.AWS_REGION;
const EVENT_BUS = process.env.EVENT_BUS;

if (typeof AWS_REGION === "undefined") {
  throw new Error("AWS region configuration missing");
}

if (typeof EVENT_BUS === "undefined") {
  throw new Error("Event Bus configuration missing");
}

const client = new EventBridgeClient({ region: AWS_REGION });

export const eventBridgeSend = async (event: any): Promise<PutEventsCommandOutput> => {
  return await client.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: EVENT_BUS,
          Source: process.env.AWS_LAMBDA_FUNCTION_NAME,
          DetailType: event.constructor.name,
          Detail: JSON.stringify(event),
        },
      ],
    })
  );
};
