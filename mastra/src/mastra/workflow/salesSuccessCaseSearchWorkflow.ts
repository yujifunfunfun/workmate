import { embedText } from "../../lib/openai-embedding";
import { searchSimilarCasesFromLibSQL } from "../../lib/libsql-vector";
import { openai } from "@ai-sdk/openai";
import { Step, Workflow } from "@mastra/core/workflows";
import { generateText } from "ai";
import { z } from "zod";

export const salesSuccessCaseSearchWorkflow = new Workflow({
  name: "salesSuccessCaseSearchWorkflow",
  triggerSchema: z.object({
    text: z.string(),
  }),
});

export const fetchSimilarSalesSearchStep = new Step({
  id: "fetchSimilarSalesSearchStep",
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
        solution: z.string(),
        outcome: z.string(),
        similarity: z.number(),
      }),
    ),
  }),
  execute: async ({ context }) => {
    const text = context.triggerData.text;

    const searchVector = await embedText(text);
    const rawResults = await searchSimilarCasesFromLibSQL(searchVector);

    // 検索結果のフィールドをマッピング
    const results = rawResults.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      date: item.date,
      industry: item.industry || "不明", // 業種/業界
      dealSize: item.dealSize || "不明", // 案件規模
      strategy: item.strategy || "不明", // 営業戦略
      solution: item.proposal || "不明", // 提案内容
      outcome: item.outcome || "不明", // 成果
      similarity: item.similarity
    }));

    return { results };
  },
});

export const llmFormatSalesStep = new Step({
  id: "llmFormatSalesStep",
  execute: async ({ context }) => {
    const results = context.getStepResult(fetchSimilarSalesSearchStep)?.results;

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `

以下のフォーマットで各事例ごとに上位3件を表示してください。
${results
  ?.map(
    (result) => `
# 類似事例
${result.title}
${result.description}
${result.date}
${result.industry}
${result.dealSize}
${result.strategy}
${result.solution}
${result.outcome}`,
  )
  .join("\n")}

# 営業成功事例レポート

## 類似成功事例一覧

### 事例 [番号]
📅 [日時]: [日時]
📄 [案件名/タイトル]: [案件名/タイトル]
🏢 [業種/業界]: [該当する業種/業界]
💼 [案件規模]: [規模や金額]
📝 [成功のポイント]: [成功要因の簡潔な説明]
💡 [使用した戦略]: [営業戦略や手法の概要]
🔑 [キーとなった提案]: [決め手となった提案内容]
📊 [結果]: [成約に至った結果や成果]

[必要に応じて事例を追加...]

## 応用サマリー
---
[質問された状況への応用方法、実践的なアドバイス、注意点などをまとめます]
    `,
    });

    return { text };
  },
});

salesSuccessCaseSearchWorkflow
  .step(fetchSimilarSalesSearchStep)
  .then(llmFormatSalesStep)
  .commit();
