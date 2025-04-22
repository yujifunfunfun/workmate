import { registerUser, authenticateUser } from "../../../lib/auth";
import type { Context } from "hono";


// ユーザー登録ハンドラー
export const registerHandler = async (c: Context) => {
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
};

// ログインハンドラー
export const loginHandler = async (c: Context) => {
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
};

// トークン検証ハンドラー
export const verifyHandler = async (c: Context) => {
  const payload = c.get('jwtPayload');
  return c.json({
    success: true,
    message: '有効なトークンです',
    user: payload
  });
};

// テストハンドラー
export const testHandler = async (c: Context) => {
  return c.json({ message: 'テスト成功' });
};
