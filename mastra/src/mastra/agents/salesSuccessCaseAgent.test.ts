import { expect, test } from "vitest";
import { salesSuccessCaseAgent } from "./salesSuccessCaseAgent";

test("salesSuccessCaseAgent should exist", () => {
  expect(salesSuccessCaseAgent).toBeDefined();
  expect(salesSuccessCaseAgent.name).toBe("営業成功事例検索エージェント");
  expect(salesSuccessCaseAgent.instructions).toContain("営業成功事例検索エージェント");
  expect(salesSuccessCaseAgent.tools).toBeDefined();
  expect(salesSuccessCaseAgent.tools.similarCasesTool).toBeDefined();
}); 
