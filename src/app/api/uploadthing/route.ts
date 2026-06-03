import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Export routes for Next App Router
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    // v7 log levels: Fatal | Error | Warning | Info | Debug | Trace
    logLevel: process.env.NODE_ENV === "development" ? "Debug" : "Info",
  },
});
