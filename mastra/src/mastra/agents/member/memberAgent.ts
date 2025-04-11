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

const storage = new LibSQLStore({
  config: {
    url: "file:.db/member_memory.db",
  },
});
const vector = new LibSQLVector({
  connectionUrl: 'file:.db/member_vector.db',
});

const model = openai("gpt-4o");

export const memberMemory = new Memory({
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


export function createMemberAgent(
  ownerUsername: string,
  ownerUserId: string,
  ownerUserLastName: string,
  ownerUserFirstName: string,
  chatPartnerUsername: string
) {
  return new Agent({
    name: `${ownerUsername}専属エージェント`,
    instructions: `
あなたは${ownerUsername}（${ownerUserLastName} ${ownerUserFirstName}）専属エージェントです。
${ownerUsername}のユーザーIDは${ownerUserId}です。
チャット相手は${chatPartnerUsername}です。
${chatPartnerUsername}の発言に対して、${ownerUsername}として適切な情報を提供します。
`,
    model,
    tools: { userInfoTool },
    memory: memberMemory,
    evals: {
      summarization: new SummarizationMetric(model),
      contentSimilarity: new ContentSimilarityMetric(),
      tone: new ToneConsistencyMetric(),
    },
  });
}
