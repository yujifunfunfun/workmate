import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { storageClient } from './storageClient';

// 環境変数からシークレットキーを取得するか、デフォルト値を使用
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

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
    expiresIn: '24Y'
  });
}

// ユーザーの登録
export async function registerUser(username: string, password: string, email: string, last_name: string, first_name: string): Promise<any> {
  const hashedPassword = hashPassword(password);

  try {
    // Prismaを使用してユーザーを作成
    const user = await storageClient.user.create({
      data: {
        username,
        password: hashedPassword,
        email: email || null,
        last_name: last_name || '',
        first_name: first_name || ''
      }
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      last_name: user.last_name,
      first_name: user.first_name,
      token: generateToken({
        id: user.id,
        username: user.username,
        email: user.email || ''
      })
    };
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    throw error;
  }
}

// ユーザーの認証
export async function authenticateUser(username: string, password: string): Promise<any> {
  try {
    // Prismaを使用してユーザーを検索
    const user = await storageClient.user.findUnique({
      where: {
        username
      }
    });

    if (!user) {
      return null;
    }

    if (!verifyPassword(user.password, password)) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      last_name: user.last_name,
      first_name: user.first_name,
      token: generateToken({
        id: user.id,
        username: user.username,
        email: user.email || ''
      })
    };
  } catch (error) {
    console.error('ユーザー認証エラー:', error);
    throw error;
  }
}

// ユーザーIDからユーザー情報を取得
export async function getUserById(userId: string): Promise<any> {
  try {
    // Prismaを使用してユーザーを検索
    const user = await storageClient.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        username: true,
        email: true,
        last_name: true,
        first_name: true
      }
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    throw error;
  }
}

// ユーザーのエージェントIDを更新
export async function updateUserAgentId(userId: string, agentId: string): Promise<boolean> {
  try {
    // Prismaを使用してユーザーを更新
    await storageClient.user.update({
      where: {
        id: userId
      },
      data: {
        agent_id: agentId
      }
    });

    return true;
  } catch (error) {
    console.error('ユーザーエージェントID更新エラー:', error);
    throw error;
  }
}
