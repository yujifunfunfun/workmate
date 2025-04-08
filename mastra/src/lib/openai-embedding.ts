import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

/**
 * テキストをOpenAIのモデルを使用してベクトル化します
 * @param text ベクトル化するテキスト
 * @returns ベクトル
 */
export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });

  return embedding;
}
