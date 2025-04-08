import { embedText } from "../../lib/openai-embedding";
import { searchSimilarCasesFromLibSQL } from "../../lib/libsql-vector";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const similarCasesTool = createTool({
  id: "find-similar-sales-cases",
  description: "テキストから類似営業成功事例を検索します。",
  inputSchema: z.object({
    text: z.string().describe("検索テキスト"),
    topK: z.number().optional().describe("返す結果の数"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        date: z.string(),
        industry: z.string(),
        dealSize: z.string(),
        strategy: z.string(),
        proposal: z.string(),
        outcome: z.string(),
        similarity: z.number(),
      }),
    ),
  }),
  execute: async ({ context }) => {
    const { text, topK } = context;
    if (!text) {
      throw new Error("text is required");
    }

    const searchVector = await embedText(text);

    // LibSQLから検索結果を取得
    const results = await searchSimilarCasesFromLibSQL(searchVector, topK);

    return { results };
  },
});
