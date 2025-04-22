import { NextRequest } from 'next/server';
import { MastraClient } from "@mastra/client-js";


const mastraClient = new MastraClient({
  baseUrl: process.env.NEXT_PUBLIC_MASTRA_API_URL || "http://localhost:4111",
});
export async function POST(req: NextRequest) {
  const body = await req.json();
  const authHeader = req.headers.get('Authorization');
  console.log(body.messages.at(-1).content[0].text);
  const m = body.messages.at(-1).content[0].text


  const agent = mastraClient.getAgent('mcpAgent');
  const response = await agent.stream({
    messages: [{ role: 'user', content: m }],
  });

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
