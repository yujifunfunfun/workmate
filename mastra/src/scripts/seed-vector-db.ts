import path from 'path';
import { config } from 'dotenv';
import { seedFromCSV } from '../lib/data-seed';

// .env.developmentファイルの読み込み
config({ path: '.env.development' });

async function main() {
  console.log('LibSQLベクターデータベースへのシード処理を開始します...');
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'セットされています' : 'セットされていません');

  // CSVファイルのパスを指定
  const csvFilePath = path.resolve(process.cwd(), 'src/data/dataset.csv');

  // シード処理の実行
  await seedFromCSV(csvFilePath);
}

main().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
