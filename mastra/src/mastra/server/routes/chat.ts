import { registerApiRoute } from "@mastra/core/server";
import { authMiddleware } from "../../../lib/middleware";
import { chatStreamHandler, chatHistoryHandler, threadsHandler, chatHistoryBetweenMembersHandler, LikesHandler, LikesRankingHandler } from "../handlers/chat";


const chatRouteConfigs = [
  {
    url: '/chat/stream',
    method: 'POST' as const,
    middleware: [authMiddleware],
    handler: chatStreamHandler
  },
  {
    url: '/chat/history',
    method: 'GET' as const,
    middleware: [authMiddleware],
    handler: chatHistoryHandler
  },
  {
    url: '/threads',
    method: 'GET' as const,
    middleware: [authMiddleware],
    handler: threadsHandler
  },
  {
    url: '/chat/histories/members',
    method: 'GET' as const,
    middleware: [authMiddleware],
    handler: chatHistoryBetweenMembersHandler
  },
  {
    url: '/chat/likes',
    method: 'GET' as const,
    middleware: [authMiddleware],
    handler: LikesHandler
  },
  {
    url: '/chat/likes/ranking',
    method: 'GET' as const,
    middleware: [authMiddleware],
    handler: LikesRankingHandler
  }
];

export const chatRoutes = chatRouteConfigs.map(config =>
  registerApiRoute(config.url, {
    method: config.method,
    middleware: config.middleware,
    handler: config.handler
  })
);
