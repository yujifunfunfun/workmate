import { MCPConfiguration } from '@mastra/mcp';


export const mcp = new MCPConfiguration({
  servers: {
    hackernews: {
      command: "npx",
      args: ["-y", "@devabdultech/hn-mcp-server"],
    },
  },
});
