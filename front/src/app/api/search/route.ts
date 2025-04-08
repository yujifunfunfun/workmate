import { NextRequest, NextResponse } from "next/server";
import { MastraClient } from "@mastra/client-js";

const mastraClient = new MastraClient({
  baseUrl: process.env.NEXT_PUBLIC_MASTRA_API_URL || "http://localhost:4111",
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "検索テキストが必要です" },
        { status: 400 }
      );
    }

    const agent = mastraClient.getAgent('salesSuccessCaseAgent');
    const response = await agent.stream({
      messages: [{ role: 'user', content: prompt }],
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
    console.error("検索エラー:", error);
    return NextResponse.json(
      { error: "事例の検索中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
