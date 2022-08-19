import { MocoUserType } from "../moco/types/moco-types";
import { findUserBySlackCommand, getUsers } from "../moco/users";
import { handler } from "./mail-signature-generator";
jest.mock("../moco/users");

const mockGetUsers = getUsers as unknown as jest.Mock;
const mockFindUserBySlackCommand = findUserBySlackCommand as unknown as jest.Mock;

describe("MailSignatureGenerator", () => {
  it("should generate a mail signature with hannover address", async () => {
    mockGetUsers.mockResolvedValue([]);
    mockFindUserBySlackCommand.mockReturnValueOnce(() => ({
      firstname: "Jörg",
      lastname: "Görisch",
      email: "joerg.goerisch@newcubator.com",
      custom_properties: {
        ["Job Bezeichnung"]: "Testsubject",
        Standort: "Hannover",
      },
    }));

    const result = await handler({
      queryStringParameters: { user_id: "U0113HJ8N2Z", user_name: "jan.sauer" },
    } as any);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toEqual({
      "Content-Type": "text/html;charset=utf-8",
    });
    expect(result.body).toMatchSnapshot();
  });

  it("should generate a mail signature with dortmund address", async () => {
    mockGetUsers.mockResolvedValue([]);
    mockFindUserBySlackCommand.mockReturnValueOnce(() => ({
      firstname: "Jörg",
      lastname: "Görisch",
      email: "joerg.goerisch@newcubator.com",
      custom_properties: {
        ["Job Bezeichnung"]: "Testsubject",
        Standort: "Dortmund",
      },
    }));

    const result = await handler({
      queryStringParameters: { user_id: "U0113HJ8N2Z", user_name: "jan.sauer" },
    } as any);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toEqual({
      "Content-Type": "text/html;charset=utf-8",
    });
    expect(result.body).toMatchSnapshot();
  });

  it("should return a useful message if the user was not found", async () => {
    mockGetUsers.mockResolvedValue([]);
    mockFindUserBySlackCommand.mockReturnValueOnce(() => null);

    const result = await handler({
      queryStringParameters: { user_id: "U0113HJ8N2Z", user_name: "jan.sauer" },
    } as any);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual("Ich konnte dich leider keinem Moco User zuordnen.");
  });
});
