import { registerApiRoute } from "@mastra/core/server";
import { authMiddleware } from "../../../lib/middleware";
import { usersHandler, userMeHandler } from "../handlers/users";


const userRouteConfigs = [
  {
    url: '/users',
    method: 'GET' as const,
    handler: usersHandler
  },
  {
    url: '/users/me',
    method: 'GET' as const,
    middleware: [authMiddleware],
    handler: userMeHandler
  }
];

export const userRoutes = userRouteConfigs.map(config =>
  registerApiRoute(config.url, {
    method: config.method,
    middleware: config.middleware || [],
    handler: config.handler
  })
);
