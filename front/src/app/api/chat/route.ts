import { NextRequest, NextResponse } from "next/server";
import { MastraClient } from "@mastra/client-js";

const mastraClient = new MastraClient({
  baseUrl: process.env.NEXT_PUBLIC_MASTRA_API_URL || "http://localhost:4111",
});

export async function POST(request: NextRequest) {
  try {
    const { messages, agentId } = await request.json();

    if (!messages || !messages.length) {
      return NextResponse.json(
        { error: "メッセージが必要です" },
        { status: 400 }
      );
    }

    const agent = mastraClient.getAgent(agentId || 'personalAgent');
    const response = await agent.stream({
      messages,
    });

    // Mastra Client の Response 形式を変換
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("チャットエラー:", error);
    return NextResponse.json(
      { error: "エージェントとのチャット中にエラーが発生しました" },
      { status: 500 }
    );
  }
} 
