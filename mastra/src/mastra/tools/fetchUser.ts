import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { fetchUserFromLibSQL } from "../../lib/fetchUser";


export const userInfoTool = createTool({
  id: "find-user-info",
  description: "ユーザーIDを指定してデータベースからユーザー情報を取得します。",
  inputSchema: z.object({
    userId: z.string().describe("ユーザーID"),
  }),
  outputSchema: z.object({
    user: z.object({
      id: z.string(),
      username: z.string(),
      email: z.string(),
      role: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }).nullable(),
  }),
  execute: async ({ context }) => {
    const { userId } = context;
    if (!userId) {
      throw new Error("userId is required");
    }

    const user = await fetchUserFromLibSQL(userId);

    return { user };
  },
});
