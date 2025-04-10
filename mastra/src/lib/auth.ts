import crypto from 'crypto';
import { createClient } from '@libsql/client';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirnameの取得（ESモジュールでは__dirnameが直接使えないため）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// 環境変数からシークレットキーを取得するか、デフォルト値を使用
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// データベース接続用クライアント
const dbClient = createClient({
  url: process.env.DB_URL || `file:${path.join(rootDir, '.db/storage.db')}`,
});

// パスワードのハッシュ化
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// パスワードの検証
export function verifyPassword(storedPassword: string, suppliedPassword: string): boolean {
  const [salt, hash] = storedPassword.split(':');
  const suppliedHash = crypto.pbkdf2Sync(suppliedPassword, salt, 1000, 64, 'sha512').toString('hex');
  return hash === suppliedHash;
}

// JWTトークンの生成
export function generateToken(user: { id: string; username: string; email: string; }): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h'
  });
}

// ユーザーの登録
export async function registerUser(username: string, password: string, email: string, agentId?: string): Promise<any> {
  const userId = crypto.randomUUID();
  const hashedPassword = hashPassword(password);

  try {
    await dbClient.execute({
      sql: `
        INSERT INTO users (id, username, password, email, agent_id)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [userId, username, hashedPassword, email || null, agentId || null]
    });

    return { id: userId, username, email, agent_id: agentId, token: generateToken({ id: userId, username, email }) };
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    throw error;
  }
}

// ユーザーの認証
export async function authenticateUser(username: string, password: string): Promise<any> {
  try {
    const result = await dbClient.execute({
      sql: `SELECT * FROM users WHERE username = ?`,
      args: [username]
    });

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    if (!verifyPassword(user.password as string, password)) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      agent_id: user.agent_id,
      token: generateToken(user as any)
    };
  } catch (error) {
    console.error('ユーザー認証エラー:', error);
    throw error;
  }
}

// ユーザーIDからユーザー情報を取得
export async function getUserById(userId: string): Promise<any> {
  try {
    const result = await dbClient.execute({
      sql: `SELECT id, username, email, role, agent_id FROM users WHERE id = ?`,
      args: [userId]
    });

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    throw error;
  }
}

// ユーザーのエージェントIDを更新
export async function updateUserAgentId(userId: string, agentId: string): Promise<boolean> {
  try {
    await dbClient.execute({
      sql: `UPDATE users SET agent_id = ? WHERE id = ?`,
      args: [agentId, userId]
    });

    return true;
  } catch (error) {
    console.error('ユーザーエージェントID更新エラー:', error);
    throw error;
  }
}
