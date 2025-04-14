import { MastraClient } from "@mastra/client-js";


const mastraClient = new MastraClient({
  baseUrl: process.env.NEXT_PUBLIC_MASTRA_API_URL || "http://localhost:4111",
});

export async function POST(req: Request) {
  const data = await req.json();

  const network = mastraClient.getNetwork('______');
  if (!network) {
    throw new Error('Research network not found');
  }

  const response = await network.stream({
    messages: data.messages,
  });


  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
