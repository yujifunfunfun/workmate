import { z } from "zod";

// ログインフォームのバリデーションスキーマ
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: "ユーザー名を入力してください" }),
  password: z
    .string()
    .min(1, { message: "パスワードを入力してください" })
});

export type LoginFormValues = z.infer<typeof loginSchema>; 
