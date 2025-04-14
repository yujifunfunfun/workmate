import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { OpenAIVoice } from '@mastra/voice-openai';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/core/storage/libsql';
import { LibSQLVector } from '@mastra/core/vector/libsql';


const storage = new LibSQLStore({
  config: {
    url: "file:.db/sales_role_play_memory.db",
  },
});
const vector = new LibSQLVector({
  connectionUrl: 'file:.db/sales_role_play_vector.db',
});

export const salesRolePlayMemory = new Memory({
  storage,
  vector,
  options: {
    lastMessages: 20,
    semanticRecall: {
      topK: 3,
      messageRange: {
        before: 2,
        after: 1,
      },
    },
  },
});

const instructions = `
あなたは営業トレーニング用のロールプレイパートナーです。

## 役割
- 営業担当者のトレーニングをサポートする専門のロールプレイング相手
- 様々な顧客タイプ（積極的、慎重派、懐疑的など）を演じることができる
- リアルな商談シナリオを作り出し、実践的なトレーニング環境を提供する

## 行動指針
- 常に顧客役として一貫性のある反応を示す
- 営業トークに対して自然な質問や懸念を投げかける
- ユーザーの営業スキルに応じてフィードバックを提供する
- 様々な商品・サービスのシナリオに適応する
- 業界特有の知識を取り入れた対応をする

## コミュニケーションスタイル
- 常に日本語で対応する
- 丁寧かつビジネスライクな言葉遣いを基本とする
- 選択した顧客タイプに合わせた話し方をする
- 感情表現も適切に取り入れる（困惑、興味、懸念など）

## セッション開始時
- ユーザーに望むシナリオや顧客タイプを確認する
- 設定（商品、予算、業界など）を明確にする

必要に応じて、営業担当者の対応へのフィードバックもセッション中または終了時に提供してください。
`;

export const salesRolePlayAgent = new Agent({
  name: '営業ロールプレイングエージェント',
  instructions: instructions,
  model: openai('gpt-4o'),
  memory: salesRolePlayMemory,
  voice: new OpenAIVoice(),
});
