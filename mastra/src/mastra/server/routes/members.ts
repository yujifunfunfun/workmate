import { registerApiRoute } from "@mastra/core/server";
import { authMiddleware } from "../../../lib/middleware";
import { memberChatStreamHandler, memberChatHistoryHandler, memberAgentsHandler, memberInfoHandler } from "../handlers/members";


const memberRouteConfigs = [
  {
    url: '/members/:username/chat/stream',
    method: 'POST' as const,
    middleware: [authMiddleware],
    handler: memberChatStreamHandler
  },
  {
    url: '/members/:username/chat/history',
    method: 'GET' as const,
    middleware: [authMiddleware],
    handler: memberChatHistoryHandler
  },
  {
    url: '/members/agents',
    method: 'GET' as const,
    middleware: [authMiddleware],
    handler: memberAgentsHandler
  },
  {
    url: '/members/:username',
    method: 'GET' as const,
    middleware: [authMiddleware],
    handler: memberInfoHandler
  }
];

export const memberRoutes = memberRouteConfigs.map(config =>
  registerApiRoute(config.url, {
    method: config.method,
    middleware: config.middleware,
    handler: config.handler
  })
);
