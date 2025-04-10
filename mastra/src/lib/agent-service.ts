import { getUserById } from './auth';
import { Agent } from '@mastra/core/agent';
import { Mastra } from '@mastra/core';

// エージェントサービスクラス
export class AgentService {
  private mastra: Mastra;
  private defaultAgent: string;
  private agentCache: Map<string, Agent> = new Map();

  constructor(mastra: Mastra, defaultAgent: string) {
    this.mastra = mastra;
    this.defaultAgent = defaultAgent;
  }

  // ユーザーIDに基づいてエージェントを取得
  async getAgentForUser(userId: string): Promise<Agent> {
    try {
      // キャッシュにエージェントがあればそれを返す
      if (this.agentCache.has(userId)) {
        return this.agentCache.get(userId)!;
      }

      // ユーザー情報を取得
      const user = await getUserById(userId);

      if (!user) {
        console.warn(`ユーザーID: ${userId} が見つかりません。デフォルトエージェントを使用します。`);
        return this.mastra.getAgent(this.defaultAgent);
      }

      // ユーザーにエージェントIDが指定されていない場合はデフォルトを使用
      if (!user.agent_id) {
        return this.mastra.getAgent(this.defaultAgent);
      }

      try {
        // ユーザーに設定されたエージェントを取得
        const agent = this.mastra.getAgent(user.agent_id);

        // キャッシュに保存
        this.agentCache.set(userId, agent);

        return agent;
      } catch (error) {
        console.error(`エージェント "${user.agent_id}" が見つかりません:`, error);
        return this.mastra.getAgent(this.defaultAgent);
      }
    } catch (error) {
      console.error('エージェント取得エラー:', error);
      return this.mastra.getAgent(this.defaultAgent);
    }
  }

  // キャッシュをクリア
  clearCache(userId?: string) {
    if (userId) {
      this.agentCache.delete(userId);
    } else {
      this.agentCache.clear();
    }
  }
}

// シングルトンインスタンスを作成するファクトリ関数
let agentServiceInstance: AgentService | null = null;

export function createAgentService(mastra: Mastra, defaultAgent: string): AgentService {
  if (!agentServiceInstance) {
    agentServiceInstance = new AgentService(mastra, defaultAgent);
  }
  return agentServiceInstance;
}
