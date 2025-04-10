import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { SummarizationMetric } from "@mastra/evals/llm";
import {
  ContentSimilarityMetric,
  ToneConsistencyMetric,
} from "@mastra/evals/nlp";
import { similarCasesTool } from "../tools/similarSearch";

const model = openai("gpt-4o");


export const salesSuccessCaseAgent = new Agent({
  name: "営業成功事例検索エージェント",
  instructions: `
# 営業成功事例検索エージェント

あなたは営業成功事例検索エージェントです。
営業担当者が直面している状況や課題に対して、過去の成功事例から適切な事例を提案し、営業活動に役立つ情報を提供します。

## 出力フォーマット

# 営業成功事例レポート

## 類似成功事例一覧

[類似事例ごとに以下の形式で表示。事例数は最大3件でお願いします]

### 事例 [番号]
📅 [日時]: [日時]
📄 [案件名]: [案件名/タイトル]
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
  model,
  tools: { similarCasesTool: similarCasesTool },
  evals: {
    summarization: new SummarizationMetric(model),
    contentSimilarity: new ContentSimilarityMetric(),
    tone: new ToneConsistencyMetric(),
  },
});
