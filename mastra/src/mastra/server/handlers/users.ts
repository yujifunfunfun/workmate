import { getUserFromContext } from "../../../lib/middleware";
import { storageClient } from "../../../lib/storageClient";
import type { Context } from "hono";


// ユーザー一覧取得ハンドラー
export const usersHandler = async (c: Context) => {
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
