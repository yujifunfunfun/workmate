import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { MCPConfiguration } from '@mastra/mcp';


const mcp = new MCPConfiguration({
  servers: {
      registry: {
        "command": "npx",
        "args": ["-y", "@mastra/mcp-registry-registry"]
      },
  },
});


export const mcpAgent = new Agent({
    name: "Registry Agent",
    instructions: "あなたはMCPレジストリのレジストリです。日本語で回答してください",
    model: openai("gpt-4o"),
    tools: await mcp.getTools(),
});
