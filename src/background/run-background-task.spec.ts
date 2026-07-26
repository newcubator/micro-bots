import { runBackgroundTask } from "./run-background-task";

describe("runBackgroundTask", () => {
  const log = jest.spyOn(console, "log").mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    log.mockRestore();
  });

  it("logs a completed task", async () => {
    runBackgroundTask({ eventType: "ExampleRequestedEvent", operationId: "operation-1", run: async () => undefined });
    await new Promise((resolve) => setImmediate(resolve));

    expect(log).toHaveBeenCalledWith(expect.stringContaining('"status":"started"'));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('"status":"completed"'));
  });

  it("contains failures and sends a Slack error response", async () => {
    const onError = jest.fn().mockResolvedValue(undefined);
    runBackgroundTask({
      eventType: "ExampleRequestedEvent",
      operationId: "operation-2",
      run: async () => Promise.reject(new Error("failed")),
      onError,
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(log).toHaveBeenCalledWith(expect.stringContaining('"status":"failed"'));
    expect(onError).toHaveBeenCalledWith("operation-2");
  });
});
