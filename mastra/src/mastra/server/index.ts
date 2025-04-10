import { registerApiRoute } from "@mastra/core/server";
import { authMiddleware, getUserFromContext, jwtAuth } from "../../lib/middleware";
import { registerUser, authenticateUser, updateUserAgentId } from "../../lib/auth";
import { createAgentService } from "../../lib/agent-service";
import type { Mastra } from "@mastra/core";
import type { Context, Next } from "hono";
import { fetchUserFromLibSQL } from "../../lib/fetchUser";
import { createUserAgent } from "../agents/user/userAgent";


export const configureServer = {
  middleware: [
    async (c: Context, next: Next) => {
      c.header('Access-Control-Allow-Origin', '*');
      c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (c.req.method === 'OPTIONS') {
        return new Response(null, { status: 204 });
      }
      return await next();
    }
  ],
  apiRoutes: [
    registerApiRoute('/a', {
      method: 'GET',
      middleware: [authMiddleware],
      handler: async (c) => {
        return c.json({ message: 'テスト成功' });
      }
    }),
    registerApiRoute('/auth/register', {
      method: 'POST',
      handler: async (c) => {
        try {
          const { username, password, email, agentId } = await c.req.json();

          if (!username || !password) {
            return c.json({ success: false, message: 'ユーザー名とパスワードは必須です' }, 400);
          }

          const user = await registerUser(username, password, email, agentId);

          return c.json({ success: true, user });
        } catch (error) {
          console.error('登録エラー:', error);
          return c.json({ success: false, message: '登録中にエラーが発生しました' }, 500);
        }
      }
    }),

    registerApiRoute('/auth/login', {
      method: 'POST',
      handler: async (c) => {
        try {
          const { username, password } = await c.req.json();

          if (!username || !password) {
            return c.json({ success: false, message: 'ユーザー名とパスワードは必須です' }, 400);
          }

          const user = await authenticateUser(username, password);

          if (!user) {
            return c.json({ success: false, message: 'ユーザー名またはパスワードが無効です' }, 401);
          }

          return c.json({ success: true, user });
        } catch (error) {
          console.error('ログインエラー:', error);
          return c.json({ success: false, message: 'ログイン中にエラーが発生しました' }, 500);
        }
      }
    }),

    registerApiRoute('/auth/verify', {
      method: 'GET',
      middleware: [jwtAuth],
      handler: async (c) => {
        const payload = c.get('jwtPayload');
        return c.json({
          success: true,
          message: '有効なトークンです',
          user: payload
        });
      }
    }),

    registerApiRoute('/users/agent', {
      method: 'PUT',
      middleware: [authMiddleware],
      handler: async (c) => {
        try {
          const { agentId } = await c.req.json();
          const user = getUserFromContext(c);

          if (!user) {
            return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
          }

          if (!agentId) {
            return c.json({ success: false, message: 'エージェントIDは必須です' }, 400);
          }

          try {
            const mastra = c.get('mastra') as Mastra;
            mastra.getAgent(agentId);
          } catch (e) {
            return c.json({ success: false, message: '指定されたエージェントが存在しません' }, 404);
          }

          await updateUserAgentId(user.id, agentId);

          const mastra = c.get('mastra') as Mastra;
          const agentService = createAgentService(mastra, 'salesSuccessCaseAgent');
          agentService.clearCache(user.id);

          return c.json({ success: true, message: 'エージェント設定が更新されました' });
        } catch (error) {
          console.error('エージェント更新エラー:', error);
          return c.json({ success: false, message: 'エージェント設定の更新中にエラーが発生しました' }, 500);
        }
      }
    }),

    registerApiRoute('/chat', {
      method: 'POST',
      middleware: [authMiddleware],
      handler: async (c) => {
        try {
          const { message, threadId, userId } = await c.req.json();
          const user = await fetchUserFromLibSQL(userId);

          if (!user) {
            return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
          }

          if (!message) {
            return c.json({ success: false, message: 'メッセージは必須です' }, 400);
          }

          // ユーザー名を取得してエージェントを生成
          const username = user.username;
          const agent = createUserAgent(username, user.id);

          const chatThreadId = threadId || `thread-${user.id}-${Date.now()}`;
          const response = await agent.generate(message, {
            resourceId: user.id,
            threadId: chatThreadId
          });

          return c.json({
            success: true,
            text: response.text,
            threadId: chatThreadId
          });
        } catch (error) {
          console.error('チャットエラー:', error);
          return c.json({ success: false, message: 'チャット処理中にエラーが発生しました' }, 500);
        }
      }
    }),

    // registerApiRoute('/chat/stream', {
    //   method: 'POST',
    //   middleware: [authMiddleware],
    //   handler: async (c) => {
    //     try {
    //       const { message, threadId, userId } = await c.req.json();
    //       const user = await fetchUserFromLibSQL(userId);

    //       if (!user) {
    //         return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
    //       }

    //       if (!message) {
    //         return c.json({ success: false, message: 'メッセージは必須です' }, 400);
    //       }

    //       const username = user.username;
    //       const agent = createUserAgent(username);

    //       const chatThreadId = threadId || `thread-${user.id}-${Date.now()}`;
    //       const stream = await agent.stream(message, {
    //         resourceId: user.id,
    //         threadId: chatThreadId
    //       });

    //       return stream;
    //     } catch (error) {
    //       console.error('ストリーミングチャットエラー:', error);
    //       return c.json({ success: false, message: 'ストリーミング処理中にエラーが発生しました' }, 500);
    //     }
    //   }
    // })
  ]
};
