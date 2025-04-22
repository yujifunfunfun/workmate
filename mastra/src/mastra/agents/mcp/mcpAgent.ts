import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { MCPConfiguration } from '@mastra/mcp';
import { favoriteFoodTool } from '../../tools/favoriteFood';
import { weatherTool } from '../../tools/weather';


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
    instructions: "あなたはMCPレジストリのレジストリです。日本語で回答してください。好きな食べ物を効かれたらtoolから取得してください。天気は場所をローマ字に変換してtoolから取得してください。",
    model: openai("gpt-4o"),
    tools: {
      ...await mcp.getTools(),
      favoriteFoodTool,
      weatherTool
    }
});
