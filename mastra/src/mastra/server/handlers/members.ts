import { getUserFromContext } from "../../../lib/middleware";
import { createMemberAgent, memberMemory } from "../../agents/member/memberAgent";
import { storageClient } from "../../../lib/storageClient";
import type { Context } from "hono";


// メンバーチャットストリームハンドラー
export const memberChatStreamHandler = async (c: Context) => {
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
};

// メンバーチャット履歴ハンドラー
export const memberChatHistoryHandler = async (c: Context) => {
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
      resourceId: `${ownerUserId}_${user.id}`,
      threadId,
      selectBy: {
        last: limit
      }
    });
    return c.json(uiMessages);
  } catch (error) {
    console.error('メッセージ履歴取得エラー:', error);
    return c.json({ success: false, message: 'メッセージ履歴の取得中にエラーが発生しました' }, 500);
  }
};


// メンバーチャットメッセージいいねハンドラー
export const memberLikeMessageHandler = async (c: Context) => {
  try {
    const ownerUserId = c.req.param('userId');
    const messageId = c.req.param('messageId');

    const user = getUserFromContext(c);
    if (!user) {
      return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
    }
    const likedUserId = user.id;
    const resourceId = `${ownerUserId}_${likedUserId}`;
    const threadId = `${ownerUserId}_${likedUserId}`;
    const id = crypto.randomUUID();
    const likedMessage = await storageClient.execute({
      sql: `
        INSERT INTO liked_messages (id, resourceId, threadId, messageId, userId, likedBy)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [id, resourceId, threadId, messageId, ownerUserId, likedUserId]
    });

    return c.json({ success: true, message: 'メッセージいいねが完了しました' });
  } catch (error) {
    console.error('メッセージいいねエラー:', error);
    return c.json({ success: false, message: 'メッセージいいね中にエラーが発生しました' }, 500);
  }
};

// メンバーエージェント一覧ハンドラー
export const memberAgentsHandler = async (c: Context) => {
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
};

// メンバー情報取得ハンドラー
export const memberInfoHandler = async (c: Context) => {
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
};
