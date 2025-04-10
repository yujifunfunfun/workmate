import { registerApiRoute } from "@mastra/core/server";
import { authMiddleware, getUserFromContext, jwtAuth } from "../../lib/middleware";
import { registerUser, authenticateUser, updateUserAgentId } from "../../lib/auth";
import { createAgentService } from "../../lib/agent-service";
import type { Mastra } from "@mastra/core";
import type { Context, Next } from "hono";
import { fetchUserFromLibSQL } from "../../lib/fetchUser";
import { createUserAgent, userMemory } from "../agents/user/userAgent";


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
          const user = getUserFromContext(c);
          const { message } = await c.req.json();
          // const message = 'こんにちは'

          if (!user) {
            return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
          }

          if (!message) {
            return c.json({ success: false, message: 'メッセージは必須です' }, 400);
          }

          const username = user.username;
          const agent = createUserAgent(username, user.id);

          const threadId = user.username
          const response = await agent.generate(message.content, {
            resourceId: user.id,
            threadId: threadId
          });
          console.log(response)

          return c.json(response.text);
        } catch (error) {
          console.error('チャットエラー:', error);
          return c.json({ success: false, message: 'チャット処理中にエラーが発生しました' }, 500);
        }
      }
    }),


    registerApiRoute('/chat/stream', {
      method: 'POST',
      middleware: [authMiddleware],
      handler: async (c) => {
        try {
          const user = getUserFromContext(c);
          const body = await c.req.json();

          let messageText;
          if (body.messages && Array.isArray(body.messages)) {
            const userMessages = body.messages.filter((m: { role: string }) => m.role === 'user');
            if (userMessages.length > 0) {
              messageText = userMessages[userMessages.length - 1].content;
            }
          } else if (body.message && typeof body.message === 'string') {
            messageText = body.message;
          } else if (body.message && body.message.content) {
            messageText = body.message.content;
          } else {
            messageText = JSON.stringify(body);
          }

          if (!user) {
            return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
          }

          if (!messageText) {
            return c.json({ success: false, message: 'メッセージは必須です' }, 400);
          }

          const username = user.username;
          const agent = createUserAgent(username, user.id);

          const threadId = user.username;

          // streamメソッドを使用してストリーミングレスポンスを取得
          try {
            const streamResponse = await agent.stream(messageText, {
              resourceId: user.id,
              threadId: threadId
            });

            // AI SDKのストリーミングレスポンスをそのまま返す
            return streamResponse.toDataStreamResponse();
          } catch (error) {
            console.error('ストリーミング生成エラー:', error);

            // フォールバック: 通常のレスポンスを試す
            try {
              const response = await agent.generate(messageText, {
                resourceId: user.id,
                threadId: threadId
              });

              // 通常のレスポンスをストリーミング形式に変換する
              return c.json({
                id: Date.now().toString(),
                object: 'chat.completion',
                choices: [
                  {
                    index: 0,
                    message: {
                      role: 'assistant',
                      content: response.text
                    }
                  }
                ]
              });

            } catch (fallbackError) {
              console.error('フォールバックエラー:', fallbackError);
              throw error; // 元のエラーをスロー
            }
          }
        } catch (error) {
          console.error('ストリーミングチャットエラー:', error);
          return c.json({
            success: false,
            message: 'ストリーミング処理中にエラーが発生しました',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, 500);
        }
      }
    }),


    registerApiRoute('/chat/history', {
      method: 'GET',
      middleware: [authMiddleware],
      handler: async (c) => {
        try {
          const user = getUserFromContext(c);
          if (!user) {
            return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
          }
          const threadId = user.username;
          const limit = parseInt(c.req.query('limit') || '20', 10);
          const memory = userMemory;
          const { uiMessages } = await memory.query({
            threadId,
            resourceId: user.id,
            selectBy: {
              last: limit
            }
          });
          return c.json(uiMessages);
        } catch (error) {
          console.error('メッセージ履歴取得エラー:', error);
          return c.json({ success: false, message: 'メッセージ履歴の取得中にエラーが発生しました' }, 500);
        }
      }
    }),

  ]
};


