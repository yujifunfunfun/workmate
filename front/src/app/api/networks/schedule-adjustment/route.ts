import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const authHeader = req.headers.get('Authorization');

  const response = await fetch(`${process.env.NEXT_PUBLIC_MASTRA_API_URL}/networks/schedule-adjustment/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader || ''
    },
    body: JSON.stringify(body)
  });

  return new Response(response.body);
}
