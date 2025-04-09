import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core";
import { salesSuccessCaseAgent } from "./agents/salesSuccessCaseAgent";
import { salesSuccessCaseSearchWorkflow } from "./workflow/salesSuccessCaseSearchWorkflow";
import { registerApiRoute } from "@mastra/core/server"
import { LibSQLStore } from "@mastra/core/storage/libsql";


const storage = new LibSQLStore({
  config: {
    url: "file:.db/storage.db",
  },
});

export const mastra = new Mastra({
  agents: { salesSuccessCaseAgent },
  workflows: { salesSuccessCaseSearchWorkflow },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
  storage,
  telemetry: {
    serviceName: "sales-success-cases-app",
    enabled: true,
    sampling: {
      type: "always_on",
    },
    export: {
      type: "otlp",
      endpoint: "http://localhost:4318/v1/traces",
    },
  },
  server: {
    apiRoutes: [
      registerApiRoute('/a', {
        method: 'GET',
        handler: async (c) => {
          // const weatherAgent = mastra.getAgent('salesSuccessCaseAgent');
          // const forecast = await weatherAgent.generate();
          return c.json({ message: 'テスト成功' });
        }
      }),
    ]
  }
});
