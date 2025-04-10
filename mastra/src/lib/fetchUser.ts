import { createClient } from "@libsql/client";


const client = createClient({
  url: "file:../../.db/storage.db",
});

export async function fetchUserFromLibSQL(userId: string) {

  try {
    const result = await client.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [userId]
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id as string,
      username: row.username as string,
      email: row.email as string,
      role: row.role as string || "",
      createdAt: row.created_at as string || new Date().toISOString(),
      updatedAt: row.updated_at as string || new Date().toISOString(),
    };
  } catch (error) {
    console.error("ユーザー情報取得エラー:", error);
    throw new Error("ユーザー情報の取得中にエラーが発生しました");
  }
}
