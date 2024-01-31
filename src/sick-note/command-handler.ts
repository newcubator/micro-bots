import { APIGatewayEvent } from "aws-lambda";

export const commandHandler = async (event: APIGatewayEvent) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      text: "Krankschreibung angefragt",
      blocks: [
        {
          type: "input",
          block_id: "radio_buttons_days",
          element: {
            type: "radio_buttons",
            options: [
              {
                text: {
                  type: "plain_text",
                  text: "Ich möchte mich für heute krank melden",
                  emoji: true,
                },
                value: "single-day",
              },
              {
                text: {
                  type: "plain_text",
                  text: "Ich wurde krank geschrieben",
                  emoji: true,
                },
                value: "multiple-days",
              },
            ],
            action_id: "radio_buttons_action",
          },
          label: {
            type: "plain_text",
            text: "Krankmeldung",
            emoji: true,
          },
        },
        {
          type: "divider",
        },
        {
          type: "context",
          elements: [
            {
              type: "plain_text",
              text: "Von wann bis wann gilt deine AU?",
              emoji: true,
            },
          ],
        },
        {
          type: "actions",
          block_id: "dates",
          elements: [
            {
              type: "datepicker",
              placeholder: {
                type: "plain_text",
                text: "Start-Datum",
                emoji: true,
              },
              action_id: "start_date",
            },
            {
              type: "datepicker",
              placeholder: {
                type: "plain_text",
                text: "End-Datum",
                emoji: true,
              },
              action_id: "end_date",
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Krank melden",
                emoji: true,
              },
              value: "Confirmation",
              style: "primary",
              action_id: "SICK_NOTE",
            },
          ],
        },
      ],
    }),
  };
};
