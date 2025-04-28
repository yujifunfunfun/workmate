import { getUserFromContext } from "../../../lib/middleware";
import { createMemberAgent, memberMemory } from "../../agents/member/memberAgent";
import { storageClient } from "../../../lib/storageClient";
import type { Context } from "hono";
import crypto from 'crypto';

// ユーザーデータの型定義
type UserData = {
  id: string;
  username: string;
  email: string | null;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
};

// メンバーチャットストリームハンドラー
export const memberChatStreamHandler = async (c: Context) => {
  try {
    const ownerUsername = c.req.param('username');

    // Prismaを使用してユーザーを検索
    const owner = await storageClient.user.findUnique({
      where: {
        username: ownerUsername
      },
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!owner || !owner.id || !owner.last_name || !owner.first_name) {
      return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
    }

    const ownerUserId = owner.id;
    const ownerUserLastName = owner.last_name;
    const ownerUserFirstName = owner.first_name;

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

    // Prismaを使用してユーザーを検索
    const owner = await storageClient.user.findUnique({
      where: {
        username: ownerUsername
      },
      select: {
        id: true
      }
    });

    if (!owner || !owner.id) {
      return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
    }

    const ownerUserId = owner.id;
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

    // Prismaを使用していいねを作成
    await storageClient.likedMessage.create({
      data: {
        resourceId,
        threadId,
        messageId,
        userId: ownerUserId,
        likedBy: likedUserId
      }
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

    // Prismaを使用した検索条件
    const whereCondition = {
      id: {
        not: user.id
      },
      ...(search ? {
        OR: [
          { username: { contains: search } },
          { email: { contains: search } },
          { first_name: { contains: search } },
          { last_name: { contains: search } }
        ]
      } : {})
    };

    // ユーザー一覧の取得
    const members = await storageClient.user.findMany({
      where: whereCondition,
      orderBy: {
        created_at: 'desc'
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        created_at: true,
        updated_at: true
      }
    });

    // 総ユーザー数の取得
    const total = await storageClient.user.count({
      where: whereCondition
    });

    // ユーザーデータのフォーマット
    const formattedMembers = members.map((member: UserData) => ({
      id: member.id,
      username: member.username,
      email: member.email,
      firstName: member.first_name,
      lastName: member.last_name,
      createdAt: member.created_at,
      updatedAt: member.updated_at
    }));

    return c.json({
      success: true,
      members: formattedMembers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + formattedMembers.length < total
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

    // Prismaを使用してユーザーを検索
    const member = await storageClient.user.findUnique({
      where: {
        username
      },
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!member) {
      return c.json({ success: false, message: 'ユーザーが見つかりません' }, 404);
    }

    // ユーザーデータのフォーマット
    const formattedMember = {
      id: member.id,
      username: member.username,
      email: member.email,
      firstName: member.first_name,
      lastName: member.last_name,
      createdAt: member.created_at,
      updatedAt: member.updated_at
    };

    return c.json(formattedMember);
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    return c.json({
      success: false,
      message: 'ユーザー情報の取得中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};
