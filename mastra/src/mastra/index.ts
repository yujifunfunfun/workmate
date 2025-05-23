import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core";
import { salesSuccessCaseAgent } from "./agents/salesSuccessCaseAgent";
import { salesSuccessCaseSearchWorkflow } from "./workflow/salesSuccessCaseSearchWorkflow";
import { LibSQLStore } from "@mastra/core/storage/libsql";
import { configureServer } from "./server";
import { userAgent } from "./agents/user/userAgent";
import { salesRolePlayAgent } from "./agents/sales-role-play/salesRolePlayAgent";
import { productStrategyPlanningNetwork } from "./networks/product-strategy-planning";
import { mcpAgent } from "./agents/mcp/mcpAgent";


const storage = new LibSQLStore({
  config: {
    url: "file:.db/storage.db",
  },
});

export const mastra = new Mastra({
  agents: { salesSuccessCaseAgent, userAgent, salesRolePlayAgent, mcpAgent },
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
  networks: { productStrategyPlanningNetwork },
  server: configureServer,
});
