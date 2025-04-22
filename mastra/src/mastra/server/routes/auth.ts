import { registerApiRoute } from "@mastra/core/server";
import { authMiddleware, jwtAuth } from "../../../lib/middleware";
import { registerHandler, loginHandler, verifyHandler, testHandler } from "../handlers/auth";


const authRouteConfigs = [
  {
    url: '/auth/register',
    method: 'POST' as const,
    handler: registerHandler
  },
  {
    url: '/auth/login',
    method: 'POST' as const,
    handler: loginHandler
  },
  {
    url: '/auth/verify',
    method: 'GET' as const,
    middleware: [jwtAuth],
    handler: verifyHandler
  },
  {
    url: '/a',
    method: 'GET' as const,
    middleware: [authMiddleware],
    handler: testHandler
  }
];

export const authRoutes = authRouteConfigs.map(config =>
  registerApiRoute(config.url, {
    method: config.method,
    middleware: config.middleware || [],
    handler: config.handler
  })
);
