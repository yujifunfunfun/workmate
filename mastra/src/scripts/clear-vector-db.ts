import * as dotenv from 'dotenv';
import { LibSQLVector } from '@mastra/core/vector/libsql';

// 環境変数読み込み
dotenv.config();

// デフォルトのインデックス名
const DEFAULT_INDEX_NAME = 'sales_cases';

// Vector Database接続インスタンスの初期化
const vectorStore = new LibSQLVector({
  connectionUrl: 'file:.db/vector.db',
});

/**
 * インデックスをクリアする
 */
async function clearIndex() {
  try {
    const indexes = await vectorStore.listIndexes();

    if (indexes.includes(DEFAULT_INDEX_NAME)) {
      console.log(`インデックス ${DEFAULT_INDEX_NAME} を削除します...`);
      await vectorStore.deleteIndex(DEFAULT_INDEX_NAME);
      console.log('インデックスを削除しました');
    } else {
      console.log(`インデックス ${DEFAULT_INDEX_NAME} は存在しません`);
    }
  } catch (error) {
    console.error('インデックス削除エラー:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('LibSQLベクターデータベースのデータをクリアします...');
    await clearIndex();
    console.log('クリア処理が完了しました！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
main();
