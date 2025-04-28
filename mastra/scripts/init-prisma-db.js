// Prismaを使用したデータベース初期化スクリプト
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirnameの取得（ESモジュールでは__dirnameが直接使えないため）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function main() {
  try {
    console.log('データベースに接続中...');

    // データベースディレクトリの存在を確認
    const dbDir = path.join(rootDir, '.db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('.dbディレクトリを作成しました');
    }

    // Prismaクライアントの初期化
    const prisma = new PrismaClient();

    try {
      // データベース接続テスト
      await prisma.$connect();
      console.log('データベースに接続しました');

      // マイグレーションを自動的に適用する
      console.log('スキーマをデータベースに適用します...');

      // テーブル一覧を取得
      const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'`;

      console.log('データベース内のテーブル:');
      tables.forEach(table => {
        console.log(`- ${table.name}`);
      });

      console.log('スクリプトの実行が完了しました！');
    } catch (error) {
      console.error('データベース操作中にエラーが発生しました:', error);
    } finally {
      // 接続を閉じる
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

main();
