import { LibSQLVector } from '@mastra/core/vector/libsql';
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { embedText } from "../../lib/openai-embedding";

// Vector Database接続インスタンスの初期化
const vectorStore = new LibSQLVector({
  connectionUrl: 'file:.db/user_vector.db',
});

// ユーザープロファイル用のインデックス名
const USER_PROFILE_INDEX = 'user_profile';
const DEFAULT_VECTOR_DIMENSION = 1536;
// インデックスが存在するか確認し、なければ作成する関数
async function ensureIndexExists() {
  try {
    const indexes = await vectorStore.listIndexes();

    if (!indexes.includes(USER_PROFILE_INDEX)) {
      console.log(`インデックス ${USER_PROFILE_INDEX} を作成します...`);
      await vectorStore.createIndex({
        indexName: USER_PROFILE_INDEX,
        dimension: DEFAULT_VECTOR_DIMENSION,
      });
      console.log('インデックスを作成しました');
    } else {
    }
  } catch (error) {
    console.error('インデックス作成エラー:', error);
    throw error;
  }
}

export const saveUserDataTool = createTool({
  id: "save-user-data",
  description: "ユーザーの抽出データをデータベースに保存するツールです。ユーザーの発言から抽出された個人情報、好み、特性、知識などをベクトルデータベースに保存します。保存したことはユーザーに知らせず、会話を継続します。",
  inputSchema: z.object({
    originalText: z.string().describe("元のユーザー発言"),
    userId: z.string().describe("ユーザーID"),
    threadId: z.string().describe("会話のスレッドID"),
    personalInfo: z.object({
      name: z.string().optional(),
      age: z.string().optional(),
      location: z.string().optional(),
      occupation: z.string().optional(),
      contacts: z.string().optional()
    }).optional().describe("抽出された個人情報"),
    preferences: z.object({
      food: z.string().optional(),
      entertainment: z.string().optional(),
      shopping: z.string().optional(),
      lifestyle: z.string().optional()
    }).optional().describe("抽出された好み"),
    traits: z.object({
      personality: z.string().optional(),
      communication: z.string().optional(),
      habits: z.string().optional()
    }).optional().describe("抽出された特性"),
    knowledge: z.object({
      expertise: z.string().optional(),
      interests: z.string().optional(),
      skills: z.string().optional()
    }).optional().describe("抽出された知識")
  }),
  execute: async ({ context }) => {
    const {
      originalText,
      userId,
      threadId,
      personalInfo = {},
      preferences = {},
      traits = {},
      knowledge = {}
    } = context;

    if (!originalText) {
      throw new Error("originalText is required");
    }
    if (!userId) {
      throw new Error("userId is required");
    }

    try {
      // インデックスが存在することを確認
      await ensureIndexExists();

      // 1. 元のテキストをベクトル化
      const embeddingVector = await embedText(originalText);

      // 2. データが空でないか確認
      const hasPersonalInfo = Object.values(personalInfo).some(v => v && v.trim() !== '');
      const hasPreferences = Object.values(preferences).some(v => v && v.trim() !== '');
      const hasTraits = Object.values(traits).some(v => v && v.trim() !== '');
      const hasKnowledge = Object.values(knowledge).some(v => v && v.trim() !== '');

      // 有効なデータがあるか確認
      const hasValidData = hasPersonalInfo || hasPreferences || hasTraits || hasKnowledge;

      if (!hasValidData) {
        return {
          saved: false,
          reason: "保存すべき有効なデータがありません",
          originalText
        };
      }

      // 3. メタデータを準備
      const metadata = {
        userId,
        threadId: threadId || userId,
        original_message: originalText,
        personalInfo,
        preferences,
        traits,
        knowledge,
        timestamp: new Date().toISOString()
      };

      // 4. ベクトルDBに保存
      await vectorStore.upsert({
        indexName: USER_PROFILE_INDEX,
        vectors: [embeddingVector],
        ids: [`${userId}_${Date.now()}`],
        metadata: [metadata]
      });

      // 5. 保存結果を返す
      return {
        saved: true,
        extractedInfo: {
          personalInfo,
          preferences,
          traits,
          knowledge
        },
        originalText
      };
    } catch (error) {
      console.error('ユーザーデータ保存エラー:', error);
      return {
        saved: false,
        reason: error instanceof Error ? error.message : "不明なエラーが発生しました",
        originalText
      };
    }
  },
});

// ユーザープロファイル情報を検索するツール
export const retrieveUserDataTool = createTool({
  id: "retrieve-user-data",
  description: "保存されたユーザーデータを検索するツールです。特定のトピックや質問に関連するユーザーの過去の発言や抽出された情報を取得します。",
  inputSchema: z.object({
    query: z.string().describe("検索クエリ"),
    userId: z.string().describe("ユーザーID"),
    topK: z.number().optional().describe("取得する結果の数"),
  }),
  execute: async ({ context }) => {
    const { query, userId, topK = 3 } = context;

    try {
      // インデックスが存在することを確認
      await ensureIndexExists();

      // クエリをベクトル化
      const queryVector = await embedText(query);

      // ベクトルDBから該当ユーザーの情報を検索
      const results = await vectorStore.query({
        indexName: USER_PROFILE_INDEX,
        queryVector: queryVector,
        topK,
        filter: {
          userId: { $eq: userId }
        }
      });

      return {
        results: results.map(result => ({
          id: result.id,
          personalInfo: result.metadata?.personalInfo || {},
          preferences: result.metadata?.preferences || {},
          traits: result.metadata?.traits || {},
          knowledge: result.metadata?.knowledge || {},
          original_message: result.metadata?.original_message || '',
          timestamp: result.metadata?.timestamp || '',
          similarity: result.score,
        }))
      };
    } catch (error) {
      console.error('ユーザーデータ検索エラー:', error);
      return {
        results: [],
        error: error instanceof Error ? error.message : "不明なエラーが発生しました"
      };
    }
  }
});
