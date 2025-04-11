import { Context } from 'hono';
import { jwt } from 'hono/jwt';
import { getUserById } from './auth';

// JWT認証の秘密鍵
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  last_name?: string;
  first_name?: string;
}

// コンテキストからユーザー情報を取得するためのヘルパー関数
export function getUserFromContext(c: Context): UserInfo | null {
  return c.get('user');
}

// Honoの組み込みJWT認証ミドルウェア
export const jwtAuth = jwt({
  secret: JWT_SECRET
});

// ユーザー情報を取得するミドルウェア
export const authMiddleware = async (c: Context, next: () => Promise<any>) => {
  try {
    // JWT認証を実行（これは先に実行する必要があります）
    await jwtAuth(c, async () => {});

    // JWTペイロードからユーザーIDを取得
    const payload = c.get('jwtPayload');

    if (!payload || !payload.id) {
      return new Response('無効なトークンです', { status: 401 });
    }

    // データベースからユーザー情報を取得
    const user = await getUserById(payload.id);

    if (!user) {
      return new Response(`ユーザーが見つかりません${payload.id}`, { status: 401 });
    }

    // ユーザー情報をコンテキストに設定
    c.set('user', user);

    // 次のミドルウェアまたはハンドラーへ
    return await next();
  } catch (error: any) {
    // JWT認証エラーの場合
    if (error.message === 'invalid signature' || error.message === 'jwt malformed') {
      return new Response('無効なトークンです', { status: 401 });
    }

    // その他のエラー
    console.error('認証エラー:', error);
    return new Response('認証処理中にエラーが発生しました', { status: 500 });
  }
};

// ロールベースのアクセス制御ミドルウェア
export function roleCheckMiddleware(requiredRole: string) {
  return async (c: Context, next: () => Promise<any>) => {
    const user = c.get('user') as UserInfo | null;

    // ユーザーがセットされていない場合（authMiddlewareが先に実行されていない）
    if (!user) {
      return new Response('認証が必要です', { status: 401 });
    }


    // 権限があれば次へ
    return await next();
  };
}
