import { getUserFromContext } from "../../../lib/middleware";
import { storageClient } from "../../../lib/storageClient";
import type { Context } from "hono";

// ユーザーの型定義
type UserData = {
  id: string;
  username: string;
  email: string | null;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
};

// ユーザー一覧取得ハンドラー
export const usersHandler = async (c: Context) => {
  try {
    // クエリパラメータの取得
    const limit = parseInt(c.req.query('limit') || '50', 10);
    const offset = parseInt(c.req.query('offset') || '0', 10);
    const search = c.req.query('search') || '';

    // Prismaを使用した検索条件
    const whereCondition = search ? {
      OR: [
        { username: { contains: search } },
        { email: { contains: search } },
        { first_name: { contains: search } },
        { last_name: { contains: search } }
      ]
    } : {};

    // ユーザー一覧の取得
    const users = await storageClient.user.findMany({
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
    const formattedUsers = users.map((user: UserData) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));

    return c.json({
      success: true,
      users: formattedUsers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + formattedUsers.length < total
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

// 自分のユーザー情報取得ハンドラー
export const userMeHandler = async (c: Context) => {
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
};
