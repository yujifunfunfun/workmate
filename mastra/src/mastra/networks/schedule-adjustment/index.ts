import { AgentNetwork } from '@mastra/core/network';
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';


export const createScheduleAdjustmentNetwork = (agents: Agent[]) => {
  return new AgentNetwork({
    name: 'スケジュール調整',
    instructions: 'スケジュールを調整します。全員の予定を確認して空いている日時を教えて下さい。予定が入っている場合はスケジュールを入れられません。マークダウン記法で出力しないでください。今何をしているかをリアルタイムで出力してください。',
    model: openai('gpt-4o'),
    agents: agents,
  });
};
