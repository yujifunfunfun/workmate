import { AgentNetwork } from '@mastra/core/network';
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

// デフォルトのエージェント定義
const createDefaultAgents = () => {
  const ceoAgent = new Agent({
    name: 'CEO Agent',
    instructions: 'あなたはCEOです',
    model: openai('gpt-4o'),
  });

  const cfoAgent = new Agent({
    name: 'CFO Agent',
    instructions: 'あなたはCFOです',
    model: openai('gpt-4o'),
  });

  const cmoAgent = new Agent({
    name: 'CMO Agent',
    instructions: 'あなたはCMOです',
    model: openai('gpt-4o'),
  });

  const ctoAgent = new Agent({
    name: 'CTO Agent',
    instructions: 'あなたはCTOです',
    model: openai('gpt-4o'),
  });

  return [ceoAgent, cfoAgent, cmoAgent, ctoAgent];
};


export const createScheduleAdjustmentNetwork = (agents: Agent[]) => {
  return new AgentNetwork({
    name: 'スケジュール調整',
    instructions: 'スケジュールを調整します。全員の予定を確認して空いている日時を教えて下さい。予定が入っている場合はスケジュールを入れられません。マークダウン記法で出力しないでください。今何をしているかをリアルタイムで出力してください。',
    model: openai('gpt-4o'),
    agents: agents,
  });
};
