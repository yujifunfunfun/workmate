import { NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const body = await req.json();
  const authHeader = req.headers.get('Authorization');

  const requestBody = {
    ...body,
    username
  };

  // Mastra APIにリクエストを転送
  const response = await fetch(`${process.env.NEXT_PUBLIC_MASTRA_API_URL}/members/${username}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader || ''
    },
    body: JSON.stringify(requestBody)
  });

  // ストリーミングレスポンスをそのまま返す
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
