import { storageClient } from "./storageClient";

export async function fetchUserFromLibSQL(userId: string) {

  try {
    const result = await storageClient.execute({
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
      last_name: row.last_name as string || "",
      first_name: row.first_name as string || "",
      createdAt: row.created_at as string || new Date().toISOString(),
      updatedAt: row.updated_at as string || new Date().toISOString(),
    };
  } catch (error) {
    console.error("ユーザー情報取得エラー:", error);
    throw new Error("ユーザー情報の取得中にエラーが発生しました");
  }
}
