import * as dotenv from 'dotenv';
import { checkRegisteredData } from '../lib/data-seed';

// 環境変数読み込み
dotenv.config();

/**
 * メイン関数
 */
async function main() {
  try {
    console.log('LibSQLベクターデータベースの登録データを確認します...');
    const results = await checkRegisteredData();
    
    // 詳細なメタデータの表示
    console.log('---詳細なメタデータ---');
    for (let i = 0; i < Math.min(results.length, 3); i++) {
      const result = results[i];
      console.log(`\n[${i + 1}] ${result.metadata?.title || '不明'} (スコア: ${result.score.toFixed(4)})`);
      
      // テキスト
      console.log(`  テキスト: ${result.metadata?.text?.substring(0, 100)}...`);
      
      // 基本メタデータ
      console.log(`  業種: ${result.metadata?.industry}`);
      console.log(`  案件規模: ${result.metadata?.dealSize}`);
      console.log(`  戦略: ${result.metadata?.strategy}`);
      
      // 抽出されたメタデータ
      if (result.metadata?.summary) {
        console.log(`  要約: ${result.metadata.summary}`);
      }
      if (result.metadata?.keyPoints) {
        console.log(`  キーポイント: ${result.metadata.keyPoints}`);
      }
      if (result.metadata?.targetPersona) {
        console.log(`  ターゲットペルソナ: ${result.metadata.targetPersona}`);
      }
      if (result.metadata?.recommendedUseCase) {
        console.log(`  推奨ユースケース: ${result.metadata.recommendedUseCase}`);
      }
    }
    
    console.log('確認処理が完了しました！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
main(); 
