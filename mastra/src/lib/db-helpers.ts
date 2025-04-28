import { storageClient } from "./storageClient";

/**
 * ユーザーを作成する
 */
export async function createUser(userData: {
  username: string;
  password: string;
  email?: string;
  first_name: string;
  last_name: string;
}) {
  try {
    const user = await storageClient.user.create({
      data: {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name
      }
    });
    return user;
  } catch (error) {
    console.error("ユーザー作成エラー:", error);
    throw error;
  }
}

/**
 * ユーザー名でユーザーを検索する
 */
export async function findUserByUsername(username: string) {
  try {
    const user = await storageClient.user.findUnique({
      where: {
        username
      }
    });
    return user;
  } catch (error) {
    console.error("ユーザー検索エラー:", error);
    throw error;
  }
}

/**
 * いいねを追加する
 */
export async function addLike(data: {
  resourceId: string;
  threadId: string;
  messageId: string;
  userId: string;
  likedBy: string;
}) {
  try {
    const like = await storageClient.likedMessage.create({
      data: {
        resourceId: data.resourceId,
        threadId: data.threadId,
        messageId: data.messageId,
        userId: data.userId,
        likedBy: data.likedBy
      }
    });
    return like;
  } catch (error) {
    console.error("いいね追加エラー:", error);
    throw error;
  }
}

/**
 * いいねを削除する
 */
export async function removeLike(messageId: string, likedBy: string) {
  try {
    const result = await storageClient.likedMessage.deleteMany({
      where: {
        messageId,
        likedBy
      }
    });
    return result;
  } catch (error) {
    console.error("いいね削除エラー:", error);
    throw error;
  }
}

/**
 * テーブル間の複雑な検索の例
 * ユーザーといいねの情報を取得
 */
export async function getUserWithLikes(userId: string) {
  try {
    const userWithLikes = await storageClient.user.findUnique({
      where: {
        id: userId
      },
      include: {
        likedMessages: true, // ユーザーがいいねしたメッセージ
        likedBy: true // ユーザーがいいねされたメッセージ
      }
    });
    return userWithLikes;
  } catch (error) {
    console.error("ユーザーおよびいいね取得エラー:", error);
    throw error;
  }
} 
