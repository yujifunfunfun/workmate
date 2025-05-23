import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { SummarizationMetric } from "@mastra/evals/llm";
import {
  ContentSimilarityMetric,
  ToneConsistencyMetric,
} from "@mastra/evals/nlp";
import { userInfoTool } from "../../tools/fetchUser";
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/core/storage/libsql';
import { LibSQLVector } from '@mastra/core/vector/libsql';
import { saveUserDataTool, retrieveUserDataTool } from "../../tools/userData";
import { getScheduleTool } from "../../tools/schedule";
import { mcp } from "./mcp";


const storage = new LibSQLStore({
  config: {
    url: "file:.db/user_memory.db",
  },
});
const vector = new LibSQLVector({
  connectionUrl: 'file:.db/user_vector.db',
});

const model = openai("gpt-4o");

export const userMemory = new Memory({
  storage,
  vector,
  options: {
    // 最新のメッセージの数
    lastMessages: 20,
    // セマンティック検索の設定
    semanticRecall: {
      topK: 3, // 取得する類似メッセージの数
      messageRange: {
        // 各結果の周りに含めるメッセージ
        before: 2,
        after: 1,
      },
    },
    // ワーキングメモリの設定
    // workingMemory: {
    //   enabled: true,
    //   template: "<user><name></name><locations><recent></recent><favorites></favorites></locations><preferences><temperature_unit></temperature_unit></preferences></user>",
    //   use: 'text-stream',
    // },
  },
});

export const userAgent = new Agent({
  name: "社員専属エージェント",
  instructions: `
あなたは社員専属エージェントです。
社員が直面している状況や課題に対して、適切な情報を提供します。
ニュースはmcpのhackernewsから取得し、出力する場合は、タイトル（リンク付き）、解説、あなたの考えを出力してください。
`,
  model,
  tools: { ...await mcp.getTools(), userInfoTool, saveUserDataTool, retrieveUserDataTool, getScheduleTool },
  memory: userMemory,
  evals: {
    summarization: new SummarizationMetric(model),
    contentSimilarity: new ContentSimilarityMetric(),
    tone: new ToneConsistencyMetric(),
  },
});


export async function createUserAgent(username: string = "社員", userId: string) {
  return new Agent({
    name: `${username}専属エージェント`,
    instructions: `
あなたは${username}専属エージェントです。
${username}のユーザーIDは${userId}です。
ニュースを聞かれたら、mcpのhackernewsから取得し、出力する場合は、タイトル（リンク付き）、解説、あなたの考えを出力してください。
`,
    model,
    tools: { ...await mcp.getTools(), userInfoTool, saveUserDataTool, retrieveUserDataTool, getScheduleTool },
    memory: userMemory,
    evals: {
      summarization: new SummarizationMetric(model),
      contentSimilarity: new ContentSimilarityMetric(),
      tone: new ToneConsistencyMetric(),
    },
  });
}
