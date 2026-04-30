import { PassThrough } from "node:stream";
import type { AppLoadContext, EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const body = new PassThrough();

    const stream = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onShellReady() {
          shellRendered = true;
          const headers = new Headers(responseHeaders);
          headers.set("Content-Type", "text/html");

          resolve(
            new Response(
              createReadableStreamFromReadable(body),
              {
                headers,
                status: responseStatusCode,
              }
            )
          );

          stream.pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          if (!shellRendered) {
            reject(error);
          }
        },
      }
    );
  });
}
