import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const authHeader = req.headers.get('Authorization');

  const response = await fetch('http://localhost:4111/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader || ''
    },
    body: JSON.stringify(body)
  });

  // ストリーミングレスポンスをそのまま返す
  return new Response(response.body);
}
