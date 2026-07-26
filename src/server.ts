import { createServer, IncomingMessage, ServerResponse } from "http";
import { commandHandler as completionNoticeCommandHandler } from "./completion-notice/command-handler";
import { handler as mailSignatureHandler } from "./functions/mail-signature";
import { handler as mailSignatureGeneratorHandler } from "./functions/mail-signature-generator";
import { commandHandler as privateChannelCommandHandler } from "./private-channel/command-handler";
import { commandHandler as shortMailCommandHandler } from "./short-mail/command-handler";
import { interactionHandler } from "./slack/interaction-handler";
import { selectMenuHandler } from "./slack/select-menu-handler";
import { commandHandler as sickNoteCommandHandler } from "./sick-note/command-handler";
import { HttpResponse } from "./http/types";

type RouteHandler = (request: { body?: string; query?: Record<string, string | undefined> }) => Promise<HttpResponse>;

const routes: Record<string, RouteHandler> = {
  "/completion-notice-command": completionNoticeCommandHandler,
  "/private-channel-command": privateChannelCommandHandler,
  "/select-menu-handler": selectMenuHandler,
  "/short-mail-command": shortMailCommandHandler,
  "/sick-note-command": sickNoteCommandHandler,
  "/slack-interaction": interactionHandler,
  "/mailSignature": mailSignatureHandler,
  "/mailSignatureGenerator": mailSignatureGeneratorHandler,
};

const readBody = (request: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;

    request.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > 1024 * 1024) {
        reject(new Error("Request body is too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });

const send = (response: ServerResponse, result: HttpResponse) => {
  response.writeHead(result.statusCode, {
    "content-type": "application/json; charset=utf-8",
    ...result.headers,
  });
  response.end(result.body);
};

const toQuery = (url: URL): Record<string, string | undefined> =>
  Object.fromEntries(url.searchParams.entries()) as Record<string, string | undefined>;

export const healthResponse = (): HttpResponse => ({ statusCode: 200, body: JSON.stringify({ status: "ok" }) });

export const createApp = () =>
  createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (request.method === "GET" && url.pathname === "/healthz") {
      send(response, healthResponse());
      return;
    }

    const handler = routes[url.pathname];
    const isSupportedMethod =
      request.method === "POST" || (request.method === "GET" && url.pathname === "/mailSignatureGenerator");
    if (!handler || !isSupportedMethod) {
      send(response, { statusCode: 404, body: JSON.stringify({ error: "Not found" }) });
      return;
    }

    try {
      const body = request.method === "POST" ? await readBody(request) : undefined;
      send(response, await handler({ body, query: toQuery(url) }));
    } catch (error) {
      console.error(
        JSON.stringify({
          service: "micro-bots",
          status: "request_failed",
          path: url.pathname,
          error: error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) },
        }),
      );
      send(response, { statusCode: 500, body: JSON.stringify({ error: "Internal server error" }) });
    }
  });

export const startServer = (port = Number(process.env.PORT ?? 3000)) => {
  const server = createApp();
  server.listen(port, "0.0.0.0", () =>
    console.log(JSON.stringify({ service: "micro-bots", status: "listening", port })),
  );
  return server;
};

if (require.main === module) startServer();
