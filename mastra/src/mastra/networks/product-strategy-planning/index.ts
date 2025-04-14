import { AgentNetwork } from '@mastra/core/network';
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';


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

// Create the network
export const productStrategyPlanningNetwork = new AgentNetwork({
  name: '製品戦略会議',
  instructions: '製品戦略を議論して決めます。全員でアイデアをブレストしてください。最終的にCEOが何にするか決定してください。',
  model: openai('gpt-4o'),
  agents: [ceoAgent, cfoAgent, cmoAgent, ctoAgent],
});
