import { registerApiRoute } from "@mastra/core/server";
import { authMiddleware } from "../../../lib/middleware";
import { scheduleAdjustmentNetworkStreamHandler } from "../handlers/networks";


const networksRouteConfigs = [
  {
    url: '/networks/schedule-adjustment/stream',
    method: 'POST' as const,
    middleware: [authMiddleware],
    handler: scheduleAdjustmentNetworkStreamHandler
  },
];

export const networksRoutes = networksRouteConfigs.map(config =>
  registerApiRoute(config.url, {
    method: config.method,
    middleware: config.middleware,
    handler: config.handler
  })
);
