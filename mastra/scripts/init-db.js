import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';
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

    // データベースに接続
    const client = createClient({
      url: 'file:.db/storage.db',
    });

    // まず mastra_evals テーブルを作成または確認
    await createEvalsTable(client);

    // 次に mastra_traces テーブルを作成または確認
    await createTracesTable(client);

    // テーブル一覧の表示
    const tables = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table'
    `);

    console.log('データベース内のテーブル:');
    tables.rows.forEach(row => {
      console.log(`- ${row.name}`);
    });

    console.log('スクリプトの実行が完了しました！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// evalsテーブルを作成する関数
async function createEvalsTable(client) {
  console.log('mastra_evalsテーブル作成を試みます...');

  // mastra_evalsテーブルの存在をチェック
  const checkTableResult = await client.execute(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='mastra_evals'
  `);

  if (checkTableResult.rows.length === 0) {
    console.log('mastra_evalsテーブルが見つかりません。作成します...');

    // テーブルの作成
    await client.execute(`
      CREATE TABLE IF NOT EXISTS mastra_evals (
        input TEXT,
        output TEXT,
        result TEXT,
        agent_name TEXT,
        metric_name TEXT,
        instructions TEXT,
        test_info TEXT,
        global_run_id TEXT,
        run_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('mastra_evalsテーブルが作成されました');

    // インデックスの作成
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_evals_agent_metric ON mastra_evals(agent_name, metric_name)
    `);
    console.log('mastra_evalsテーブルにインデックスが作成されました');
  } else {
    console.log('mastra_evalsテーブルは既に存在します');
  }
}

// tracesテーブルを作成する関数
async function createTracesTable(client) {
  console.log('mastra_tracesテーブル作成を試みます...');

  // mastra_tracesテーブルの存在をチェック
  const checkTableResult = await client.execute(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='mastra_traces'
  `);

  if (checkTableResult.rows.length === 0) {
    console.log('mastra_tracesテーブルが見つかりません。作成します...');

    // テーブルの作成
    await client.execute(`
      CREATE TABLE IF NOT EXISTS mastra_traces (
        id TEXT NOT NULL PRIMARY KEY,
        parentSpanId TEXT,
        name TEXT NOT NULL,
        traceId TEXT NOT NULL,
        scope TEXT NOT NULL,
        kind INTEGER NOT NULL,
        attributes TEXT,
        status TEXT,
        events TEXT,
        links TEXT,
        other TEXT,
        startTime BIGINT NOT NULL,
        endTime BIGINT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log('mastra_tracesテーブルが作成されました');

    // インデックスの作成
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_traces_traceId ON mastra_traces(traceId)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_traces_name ON mastra_traces(name)
    `);
    console.log('mastra_tracesテーブルにインデックスが作成されました');
  } else {
    console.log('mastra_tracesテーブルは既に存在します');
  }
}

main();
