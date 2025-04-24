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

    await createEvalsTable(client);
    await createTracesTable(client);
    await createUsersTable(client);
    await createLikedMessagesTable(client);

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

// ユーザーテーブルを作成する関数
async function createUsersTable(client) {
  console.log('usersテーブル作成を試みます...');

  // usersテーブルの存在をチェック
  const checkTableResult = await client.execute(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='users'
  `);

  if (checkTableResult.rows.length === 0) {
    console.log('usersテーブルが見つかりません。作成します...');

    // テーブルの作成
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT NOT NULL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        last_name TEXT NOT NULL,
        first_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('usersテーブルが作成されました');

    // インデックスの作成
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);
    console.log('usersテーブルにインデックスが作成されました');
  } else {
    console.log('usersテーブルは既に存在します');
  }
}

// likedMessagesテーブルを作成する関数
async function createLikedMessagesTable(client) {
  console.log('liked_messagesテーブル作成を試みます...');

  // liked_messagesテーブルの存在をチェック
  const checkTableResult = await client.execute(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='liked_messages'
  `);

  if (checkTableResult.rows.length > 0) {
    console.log('liked_messagesテーブルが既に存在します。削除します...');
    await client.execute(`DROP TABLE liked_messages`);
    console.log('liked_messagesテーブルを削除しました');
  }

  console.log('liked_messagesテーブルを作成します...');

  // テーブルの作成
  await client.execute(`
    CREATE TABLE IF NOT EXISTS liked_messages (
      id TEXT NOT NULL PRIMARY KEY,
      resourceId TEXT NOT NULL,
      threadId TEXT NOT NULL,
      messageId TEXT NOT NULL,
      userId TEXT NOT NULL,
      likedBy TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (likedBy) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('liked_messagesテーブルが作成されました');

  // インデックスの作成
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_liked_messages_user ON liked_messages(userId)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_liked_messages_thread ON liked_messages(threadId)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_liked_messages_message ON liked_messages(messageId)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_liked_messages_likedby ON liked_messages(likedBy)
  `);
  console.log('liked_messagesテーブルにインデックスが作成されました');
}

main();
