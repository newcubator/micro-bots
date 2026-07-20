import { findUserBySlackIdentity } from "./users";

const users = [
  {
    id: "1",
    firstname: "Max",
    lastname: "Mustermann",
    email: "max.mustermann@newcubator.com",
    custom_properties: {
      SlackId: "U123",
    },
  },
  {
    id: "2",
    firstname: "Jörg",
    lastname: "Herbst",
    email: "joerg.herbst@newcubator.com",
    custom_properties: {},
  },
] as any;

describe("findUserBySlackIdentity", () => {
  it("finds users by slack id", () => {
    expect(findUserBySlackIdentity(users, { user_id: "U123" })).toEqual(users[0]);
  });

  it("normalizes casing and whitespace for slack ids", () => {
    expect(findUserBySlackIdentity(users, { user_id: " u123 " })).toEqual(users[0]);
  });

  it("finds users by slack profile email", () => {
    expect(findUserBySlackIdentity(users, { user_email: "joerg.herbst@newcubator.com" })).toEqual(users[1]);
  });

  it("normalizes casing and whitespace for slack profile emails", () => {
    expect(findUserBySlackIdentity(users, { user_email: " JOERG.HERBST@newcubator.com " })).toEqual(users[1]);
  });

  it("finds users by normalized mail prefix", () => {
    expect(findUserBySlackIdentity(users, { user_name: "joerg-herbst" })).toEqual(users[1]);
  });

  it("finds users by real name", () => {
    expect(findUserBySlackIdentity(users, { real_name: "Jorg Herbst" })).toEqual(users[1]);
  });

  it("finds users by display name", () => {
    expect(findUserBySlackIdentity(users, { display_name: " JORG  HERBST " })).toEqual(users[1]);
  });

  it("returns undefined when no user matches", () => {
    expect(findUserBySlackIdentity(users, { user_id: "unknown", user_name: "unknown" })).toBeUndefined();
  });
});
