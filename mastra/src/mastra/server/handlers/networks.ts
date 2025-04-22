import { getUserFromContext } from "../../../lib/middleware";
import { createUserAgent } from "../../agents/user/userAgent";
import type { Context } from "hono";
import { createScheduleAdjustmentNetwork } from "../../networks/schedule-adjustment";


export const scheduleAdjustmentNetworkStreamHandler = async (c: Context) => {
  try {
    console.log("scheduleAdjustmentNetworkStreamHandler");
    const user = getUserFromContext(c);
    if (!user) return c.json({ success: false, message: 'ユーザー情報が見つかりません' }, 401);

    const body = await c.req.json();
    const userId = user.id;
    const username = user.username;
    const members = body.members;

    const userAgent = createUserAgent(username, userId);
    let agents = [userAgent];
    for (const member of members) {
      const memberAgent = createUserAgent(member.username, member.userId);
      agents.push(memberAgent);
    }

    const network = createScheduleAdjustmentNetwork(agents);
    const streamResponse = await network.stream(body.prompt);
    return streamResponse.toDataStreamResponse();
    }
    catch (error) {
      console.error('ストリーミング生成エラー:', error);
    }
};
