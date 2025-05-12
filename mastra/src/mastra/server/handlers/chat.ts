import { getUserFromContext } from "../../../lib/middleware";
import { createUserAgent, userMemory } from "../../agents/user/userAgent";
import type { Context } from "hono";
import { memberMemory } from "../../agents/member/memberAgent";
import { storageClient } from "../../../lib/storageClient";

// 型定義の追加
type UserWithDetails = {
  id: string;
  username: string;
  email: string | null;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
};

// いいねの型定義を分離
type LikedMessageBase = {
  id: string;
  resourceId: string;
  threadId: string;
  messageId: string;
  userId: string;
  likedBy: string;
  created_at: Date;
};

// LikesHandlerで使用
type LikedMessageWithLikedByUser = LikedMessageBase & {
  likedByUser: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string | null;
  };
};

// LikesRankingHandlerで使用
type LikedMessageForRanking = LikedMessageBase & {
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string | null;
  };
};


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
    const agent = await createUserAgent(username, user.id);

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

    // Prismaを使用してすべてのユーザーを取得
    const users = await storageClient.user.findMany({
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

    const histories = await Promise.all(users.map(async (user2: UserWithDetails) => {
      const memory = memberMemory;
      try {
        const { uiMessages } = await memory.query({
          resourceId: `${user.id}_${user2.id}`,
          threadId : `${user.id}_${user2.id}`,
          selectBy: {
            last: 20
          }
        });
        return {
          id: user2.id,
          username: user2.username,
          firstName: user2.first_name,
          lastName: user2.last_name,
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

// いいね取得ハンドラー
export const LikesHandler = async (c: Context) => {
  try {
    const user = getUserFromContext(c);
    if (!user) {
      return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
    }
    const userId = user.id;

    // Prismaを使用していいねを取得
    const likes = await storageClient.likedMessage.findMany({
      where: {
        userId: userId
      },
      include: {
        likedByUser: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });

    const count = likes.length;

    // 結果をフォーマット
    const formattedLikes = likes.map((like: LikedMessageWithLikedByUser) => ({
      id: like.id,
      resourceId: like.resourceId,
      threadId: like.threadId,
      messageId: like.messageId,
      userId: like.userId,
      likedBy: like.likedBy,
      created_at: like.created_at,
      liked_by_username: like.likedByUser.username,
      liked_by_first_name: like.likedByUser.first_name,
      liked_by_last_name: like.likedByUser.last_name,
      liked_by_email: like.likedByUser.email
    }));

    // ユーザーごとにグループ化
    const userMessageMap = new Map();

    // 全てのメッセージを処理
    const likedMessages = await Promise.all(formattedLikes.map(async (row: any) => {
      const memory = memberMemory;
      const messageId = row.messageId;
      if (!messageId) return null;
      try {
        const { uiMessages } = await memory.query({
          resourceId: `${user.id}_${row.likedBy}`,
          threadId : `${user.id}_${row.likedBy}`,
          selectBy: {
            include: [
              {
                id: messageId.toString(),
              },
            ],
          }
        });

        // メッセージ内容と基本情報を取得
        const filteredMessage = uiMessages.find(message => message.id === messageId.toString());
        const messageContent = filteredMessage?.content || null;

        // ユーザーIDとメッセージコンテンツをキーにしてグループ化
        const userKey = row.likedBy;

        if (!userMessageMap.has(userKey)) {
          // 新しいユーザーエントリを作成
          userMessageMap.set(userKey, {
            id: row.id,
            liked_by_last_name: row.liked_by_last_name,
            liked_by_first_name: row.liked_by_first_name,
            liked_by_username: row.liked_by_username,
            messageId: messageId,
            messages: [],
            messageContents: new Map() // 内部で使用する一時マップ
          });
        }

        // ユーザーのメッセージリストを取得
        const userEntry = userMessageMap.get(userKey);
        // 同じコンテンツのメッセージがすでに存在するか確認
        if (messageContent && !userEntry.messageContents.has(messageContent)) {
          // 新しいメッセージを追加
          userEntry.messages.push({
            content: messageContent,
            likeCount: 1
          });
          userEntry.messageContents.set(messageContent, userEntry.messages.length - 1);
        } else if (messageContent) {
          // 既存のメッセージのlikeCountを増やす
          const messageIndex = userEntry.messageContents.get(messageContent);
          userEntry.messages[messageIndex].likeCount += 1;
        }

        return true; // 処理が成功したことを示す
      } catch (error) {
        console.error('メッセージ取得エラー:', error);
        return null;
      }
    }));

    for (const userEntry of userMessageMap.values()) {
      delete userEntry.messageContents;
    }

    const groupedLikedMessages = Array.from(userMessageMap.values());

    return c.json({groupedLikedMessages, count:count});
  } catch (error) {
    console.error('メッセージいいねエラー:', error);
    return c.json({ success: false, message: 'メッセージいいね中にエラーが発生しました' }, 500);
  }
};

// いいねランキング取得ハンドラー
export const LikesRankingHandler = async (c: Context) => {
  try {
    const user = getUserFromContext(c);
    if (!user) {
      return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);
    }

    // Prismaを使ったいいねのグループ化と集計
    // SQLiteではgroup byとカウントをPrismaで直接実行する方法が制限されているため
    // 代わりにすべてのいいねを取得してJavaScriptで集計する
    const allLikes = await storageClient.likedMessage.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });

    // いいねをユーザーIDごとにグループ化して集計
    const likesCountByUser = new Map<string, any>();
    allLikes.forEach((like: LikedMessageForRanking) => {
      const userId = like.userId;
      const userInfo = like.user;

      if (!likesCountByUser.has(userId)) {
        likesCountByUser.set(userId, {
          userId,
          username: userInfo.username,
          firstName: userInfo.first_name,
          lastName: userInfo.last_name,
          email: userInfo.email,
          likeCount: 0
        });
      }

      const userEntry = likesCountByUser.get(userId);
      userEntry.likeCount += 1;
    });

    // いいね数で降順ソートしてランキングを作成
    const rankings = Array.from(likesCountByUser.values())
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 10)
      .map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        username: entry.username,
        firstName: entry.firstName,
        lastName: entry.lastName,
        likeCount: entry.likeCount
      }));

    return c.json(rankings);
  } catch (error) {
    console.error('いいねランキング取得エラー:', error);
    return c.json({ success: false, message: 'いいねランキング取得中にエラーが発生しました' }, 500);
  }
};

