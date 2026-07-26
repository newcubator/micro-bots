import { healthResponse } from "./server";

describe("HTTP server", () => {
  it("returns the Kubernetes health response", () => {
    expect(healthResponse()).toEqual({ statusCode: 200, body: JSON.stringify({ status: "ok" }) });
  });
});
