import { LibSQLVector } from '@mastra/core/vector/libsql';

// Vector Database接続インスタンスの初期化
const vectorStore = new LibSQLVector({
  connectionUrl: process.env.DATABASE_URL || 'file:.db/user_vector.db',
});

// デフォルトのインデックス名
const DEFAULT_INDEX_NAME = 'user_data';


export async function saveUserDataToLibSQL(
  searchVector: number[],
  topK: number = 5
) {
  try {
    // インデックスがあるか確認し、なければ作成する処理は本来必要
    const results = await vectorStore.query({
      indexName: DEFAULT_INDEX_NAME,
      queryVector: searchVector,
      topK,
    });

    // 検索結果を適切なフォーマットに変換
    return results.map(result => ({
      id: result.id,
      title: result.metadata?.title || '',
      description: result.metadata?.description || '',
      date: result.metadata?.date || '',
      industry: result.metadata?.industry || '',      // 業種/業界
      dealSize: result.metadata?.dealSize || '',      // 案件規模
      strategy: result.metadata?.strategy || '',      // 営業戦略
      proposal: result.metadata?.solution || '',      // 提案内容
      outcome: result.metadata?.outcome || '',        // 成果
      similarity: result.score,
    }));
  } catch (error) {
    console.error('Vector search error:', error);
    return [];
  }
}
