import { authMiddleware, getUserFromContext } from "../../../lib/middleware";
import { createUserAgent, userMemory } from "../../agents/user/userAgent";
import type { Context } from "hono";
import { memberMemory } from "../../agents/member/memberAgent";
import { storageClient } from "../../../lib/storageClient";


// チャットストリーム処理ハンドラー
export const chatStreamHandler = async (c: Context) => {
  try {
    const user = getUserFromContext(c);
    const body = await c.req.json();
    const threadId = body.threadId;

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

    // streamメソッドを使用してストリーミングレスポンスを取得
    try {
      const streamResponse = await agent.stream(messageText, {
        resourceId: user.id,
        threadId: threadId,
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
};

// チャット履歴取得ハンドラー
export const chatHistoryHandler = async (c: Context) => {
  try {
    const user = getUserFromContext(c);
    if (!user) {
      return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
    }

    const threadId = c.req.query('threadId');

    if (!threadId) {
      return c.json([]);
    }
    const limit = parseInt(c.req.query('limit') || '20', 10);
    const memory = userMemory;
    const { uiMessages } = await memory.query({
      resourceId: user.id,
      threadId,
      selectBy: {
        last: limit
      }
    });
    return c.json(uiMessages);
  } catch (error) {
    console.error('メッセージ履歴取得エラー:', error);
    return c.json([]);
  }
};

// スレッド一覧取得ハンドラー
export const threadsHandler = async (c: Context) => {
  try {
    const user = getUserFromContext(c);
    if (!user) {
      return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
    }
    const memory = userMemory;
    const threads = await memory.getThreadsByResourceId({
      resourceId: user.id,
    });

    // 日時の新しい順に並べ替え（updatedAtまたはcreatedAtを使用）
    const sortedThreads = threads.sort((a, b) => {
      // updatedAtフィールドがある場合はそれを使用
      const dateA = a.updatedAt || a.createdAt || 0;
      const dateB = b.updatedAt || b.createdAt || 0;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    // 今日、過去7日間、それ以前に分類
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const categorizedThreads = {
      today: sortedThreads.filter(thread => {
        const threadDate = new Date(thread.updatedAt || thread.createdAt || 0);
        return threadDate >= today;
      }),
      pastWeek: sortedThreads.filter(thread => {
        const threadDate = new Date(thread.updatedAt || thread.createdAt || 0);
        return threadDate >= oneWeekAgo && threadDate < today;
      }),
      older: sortedThreads.filter(thread => {
        const threadDate = new Date(thread.updatedAt || thread.createdAt || 0);
        return threadDate < oneWeekAgo;
      })
    };

    return c.json(categorizedThreads);
  } catch (error) {
    console.error('メッセージ履歴取得エラー:', error);
    return c.json({ success: false, message: 'メッセージ履歴の取得中にエラーが発生しました' }, 500);
  }
};


export const chatHistoryBetweenMembersHandler = async (c: Context) => {
  try {
    const user = getUserFromContext(c);
    if (!user) {
      return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
    }
    let sql = `
      SELECT id, username, email, first_name, last_name, created_at, updated_at
      FROM users
    `;
    const result = await storageClient.execute({
      sql,
    });
    const histories = await Promise.all(result.rows.map(async row => {
      const memory = memberMemory;
      try {
        const { uiMessages } = await memory.query({
          resourceId: `${user.id}_${row.id}`,
          threadId : `${user.id}_${row.id}`,
          selectBy: {
            last: 20
          }
        });
        return {
          id: row.id,
          username: row.username,
          firstName: row.first_name,
          lastName: row.last_name,
          messages: uiMessages
        }
      } catch (error) {
        return null;
      }
    }));

    return c.json(histories.filter(history => history !== null));
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    return c.json({
      success: false,
      message: 'ユーザー情報取得エラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};
