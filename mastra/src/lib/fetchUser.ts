import { storageClient } from "./storageClient";

export async function fetchUserFromLibSQL(userId: string) {
  try {
    // Prismaを使用してユーザーを取得
    const user = await storageClient.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email || "",
      last_name: user.last_name || "",
      first_name: user.first_name || "",
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString(),
    };
  } catch (error) {
    console.error("ユーザー情報取得エラー:", error);
    throw new Error("ユーザー情報の取得中にエラーが発生しました");
  }
}
