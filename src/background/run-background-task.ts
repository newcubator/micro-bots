import { randomUUID } from "crypto";

type BackgroundTask = {
  eventType: string;
  operationId?: string;
  context?: Record<string, string | undefined>;
  run: () => Promise<void>;
  onError?: (operationId: string) => Promise<void>;
};

const log = (entry: Record<string, unknown>) => console.log(JSON.stringify({ service: "micro-bots", ...entry }));

export const runBackgroundTask = ({ eventType, operationId = randomUUID(), context, run, onError }: BackgroundTask) => {
  void (async () => {
    const startedAt = performance.now();
    log({ status: "started", eventType, operationId, ...context });

    try {
      await run();
      log({
        status: "completed",
        eventType,
        operationId,
        durationMs: Math.round(performance.now() - startedAt),
        ...context,
      });
    } catch (error) {
      log({
        status: "failed",
        eventType,
        operationId,
        durationMs: Math.round(performance.now() - startedAt),
        ...context,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) },
      });

      if (onError) {
        try {
          await onError(operationId);
        } catch (responseError) {
          log({
            status: "error_response_failed",
            eventType,
            operationId,
            ...context,
            error:
              responseError instanceof Error
                ? { message: responseError.message, stack: responseError.stack }
                : { message: String(responseError) },
          });
        }
      }
    }
  })();
};
