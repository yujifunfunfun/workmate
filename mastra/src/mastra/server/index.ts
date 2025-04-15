import { registerApiRoute } from "@mastra/core/server";
import { authMiddleware, getUserFromContext, jwtAuth } from "../../lib/middleware";
import { registerUser, authenticateUser } from "../../lib/auth";
import type { Context, Next } from "hono";
import { createUserAgent, userMemory } from "../agents/user/userAgent";
import { storageClient } from "../../lib/storageClient";
import { createMemberAgent } from "../agents/member/memberAgent";
import { memberMemory } from "../agents/member/memberAgent";


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
          const { username, password, email, last_name, first_name } = await c.req.json();

          if (!username || !password) {
            return c.json({ success: false, message: 'ユーザー名とパスワードは必須です' }, 400);
          }

          const user = await registerUser(username, password, email, last_name, first_name);

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
              const lastUserMessage = userMessages[userMessages.length - 1];
              if (Array.isArray(lastUserMessage.content)) {
                // 新しい形式: content が配列で、その中に {type: 'text', text: '...'} オブジェクトがある
                const textContent = lastUserMessage.content.find((item: any) => item.type === 'text');
                if (textContent) {
                  messageText = textContent.text;
                }
              } else {
                // 以前の形式: content が直接テキスト
                messageText = lastUserMessage.content;
              }
            }
          } else if (body.message && typeof body.message === 'string') {
            messageText = body.message;
          } else if (body.message && Array.isArray(body.message.content)) {
            // 新しい形式に対応: content が配列
            const textContent = body.message.content.find((item: any) => item.type === 'text');
            if (textContent) {
              messageText = textContent.text;
            }
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

    registerApiRoute('/members/:username/chat/stream', {
      method: 'POST',
      middleware: [authMiddleware],
      handler: async (c) => {
        try {
          const ownerUsername = c.req.param('username');
          const sql = `
            SELECT id, username, email, first_name, last_name, created_at, updated_at
            FROM users
            WHERE username = ?
          `;
          const result = await storageClient.execute({
            sql,
            args: [ownerUsername]
          });

          const ownerUserId = result.rows[0].id;
          const ownerUserLastName = result.rows[0].last_name;
          const ownerUserFirstName = result.rows[0].first_name;
          if (!ownerUserId || !ownerUserLastName || !ownerUserFirstName) {
            return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
          }
          const user = getUserFromContext(c);
          const body = await c.req.json();

          let messageText;
          if (body.messages && Array.isArray(body.messages)) {
            const userMessages = body.messages.filter((m: { role: string }) => m.role === 'user');
            if (userMessages.length > 0) {
              const lastUserMessage = userMessages[userMessages.length - 1];
              if (Array.isArray(lastUserMessage.content)) {
                // 新しい形式: content が配列で、その中に {type: 'text', text: '...'} オブジェクトがある
                const textContent = lastUserMessage.content.find((item: any) => item.type === 'text');
                if (textContent) {
                  messageText = textContent.text;
                }
              } else {
                // 以前の形式: content が直接テキスト
                messageText = lastUserMessage.content;
              }
            }
          } else if (body.message && typeof body.message === 'string') {
            messageText = body.message;
          } else if (body.message && Array.isArray(body.message.content)) {
            // 新しい形式に対応: content が配列
            const textContent = body.message.content.find((item: any) => item.type === 'text');
            if (textContent) {
              messageText = textContent.text;
            }
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

          const chatPartnerUsername = user.username;
          const agent = createMemberAgent(ownerUsername, ownerUserId.toString(), ownerUserLastName.toString(), ownerUserFirstName.toString(), chatPartnerUsername);

          const threadId = user.username;

          try {
            const streamResponse = await agent.stream(messageText, {
              resourceId: `${ownerUserId}_${user.id}`,
              threadId: `${ownerUserId}_${user.id}`
            });

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

    registerApiRoute('/members/:username/chat/history', {
      method: 'GET',
      middleware: [authMiddleware],
      handler: async (c) => {
        try {
          const user = getUserFromContext(c);
          if (!user) {
            return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
          }

          const ownerUsername = c.req.param('username');
          const sql = `
            SELECT id, username, email, first_name, last_name, created_at, updated_at
            FROM users
            WHERE username = ?
          `;
          const result = await storageClient.execute({
            sql,
            args: [ownerUsername]
          });

          const ownerUserId = result.rows[0].id;
          if (!ownerUserId) {
            return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
          }

          const threadId = `${ownerUserId}_${user.id}`;
          const limit = parseInt(c.req.query('limit') || '20', 10);
          const memory = memberMemory;
          const { uiMessages } = await memory.query({
            threadId,
            resourceId: `${ownerUserId}_${user.id}`,
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





    registerApiRoute('/users', {
      method: 'GET',
      handler: async (c) => {
        try {

          // クエリパラメータの取得
          const limit = parseInt(c.req.query('limit') || '50', 10);
          const offset = parseInt(c.req.query('offset') || '0', 10);
          const search = c.req.query('search') || '';

          // データベースからユーザー一覧を取得
          let sql = `
            SELECT id, username, email, first_name, last_name, created_at, updated_at
            FROM users
          `;

          const args: any[] = [];

          // 検索条件がある場合
          if (search) {
            sql += ` WHERE username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?`;
            const searchPattern = `%${search}%`;
            args.push(searchPattern, searchPattern, searchPattern, searchPattern);
          }

          // ソートと制限
          sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
          args.push(limit, offset);



          // ユーザー一覧の取得
          const result = await storageClient.execute({
            sql,
            args
          });

          // 総ユーザー数の取得
          let countSql = `SELECT COUNT(*) as total FROM users`;
          if (search) {
            countSql += ` WHERE username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?`;
          }

          const countResult = await storageClient.execute({
            sql: countSql,
            args: search ? [
              `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`
            ] : []
          });

          const total = countResult.rows[0].total as number;

          // ユーザーデータのフォーマット
          const users = result.rows.map(row => ({
            id: row.id,
            username: row.username,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          return c.json({
            success: true,
            users,
            pagination: {
              total,
              limit,
              offset,
              hasMore: offset + users.length < total
            }
          });
        } catch (error) {
          console.error('ユーザー一覧取得エラー:', error);
          return c.json({
            success: false,
            message: 'ユーザー一覧の取得中にエラーが発生しました',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, 500);
        }
      }
    }),


    registerApiRoute('/users/me', {
      method: 'GET',
      middleware: [authMiddleware],
      handler: async (c) => {
        try {
          const user = getUserFromContext(c);
          if (!user) {
            return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
          }
          return c.json(user);
        } catch (error) {
          console.error('ユーザー情報取得エラー:', error);
          return c.json({
            success: false,
            message: 'ユーザー情報取得エラーが発生しました',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, 500);
        }
      }
    }),

    registerApiRoute('/members/agents', {
      method: 'GET',
      middleware: [authMiddleware],
      handler: async (c) => {
        try {
          const user = getUserFromContext(c);
          if (!user) {
            return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
          }
          // クエリパラメータの取得
          const limit = parseInt(c.req.query('limit') || '50', 10);
          const offset = parseInt(c.req.query('offset') || '0', 10);
          const search = c.req.query('search') || '';

          // データベースからユーザー一覧を取得
          let sql = `
            SELECT id, username, email, first_name, last_name, created_at, updated_at
            FROM users
            WHERE id != ?
          `;

          const args: any[] = [user.id];

          // 検索条件がある場合
          if (search) {
            sql += ` AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
            const searchPattern = `%${search}%`;
            args.push(searchPattern, searchPattern, searchPattern, searchPattern);
          }

          // ソートと制限
          sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
          args.push(limit, offset);



          // ユーザー一覧の取得
          const result = await storageClient.execute({
            sql,
            args
          });

          // 総ユーザー数の取得
          let countSql = `SELECT COUNT(*) as total FROM users WHERE id != ?`;
          if (search) {
            countSql += ` AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
          }

          const countResult = await storageClient.execute({
            sql: countSql,
            args: search ? [
              user.id, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`
            ] : [user.id]
          });

          const total = countResult.rows[0].total as number;

          // ユーザーデータのフォーマット
          const members = result.rows.map(row => ({
            id: row.id,
            username: row.username,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          return c.json({
            success: true,
            members: members,
            pagination: {
              total,
              limit,
              offset,
              hasMore: offset + members.length < total
            }
          });
        } catch (error) {
          console.error('ユーザー一覧取得エラー:', error);
          return c.json({
            success: false,
            message: 'ユーザー一覧の取得中にエラーが発生しました',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, 500);
        }
      }
    }),


    registerApiRoute('/members/:username', {
      method: 'GET',
      middleware: [authMiddleware],
      handler: async (c) => {
        try {
          const user = getUserFromContext(c);
          if (!user) {
            return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
          }

          const username = c.req.param('username');

          if (!username) {
            return c.json({ success: false, message: 'ユーザー名が必要です' }, 400);
          }

          // データベースから指定したユーザー名のユーザーを取得
          const sql = `
            SELECT id, username, email, first_name, last_name, created_at, updated_at
            FROM users
            WHERE username = ?
          `;

          // ユーザー情報の取得
          const result = await storageClient.execute({
            sql,
            args: [username]
          });

          if (result.rows.length === 0) {
            return c.json({ success: false, message: 'ユーザーが見つかりません' }, 404);
          }

          // ユーザーデータのフォーマット
          const member = {
            id: result.rows[0].id,
            username: result.rows[0].username,
            email: result.rows[0].email,
            firstName: result.rows[0].first_name,
            lastName: result.rows[0].last_name,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at
          };

          return c.json(member);
        } catch (error) {
          console.error('ユーザー情報取得エラー:', error);
          return c.json({
            success: false,
            message: 'ユーザー情報の取得中にエラーが発生しました',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, 500);
        }
      }
    }),
  ]
};


