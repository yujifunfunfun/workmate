import { createTool } from "@mastra/core/tools";
import { z } from "zod";


export const favoriteFoodTool = createTool({
  id: "find-favorite-food-info",
  description: "ユーザーの好きな食べ物を取得します。",
  outputSchema: z.object({
    favoriteFood: z.array(z.string()).describe("ユーザーの好きな食べ物"),
  }),
  execute: async ({ context }) => {

    const favoriteFood = ['りんご', 'カレーライス', 'コーラ'];

    return { favoriteFood };
  },
});
