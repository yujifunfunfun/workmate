import { MastraClient } from "@mastra/client-js";


const mastraClient = new MastraClient({
  baseUrl: process.env.NEXT_PUBLIC_MASTRA_API_URL || "http://localhost:4111",
});
export async function POST(req: Request) {
  const formData = await req.formData();
  const audioFile = formData.get('audio') as File;

  const arrayBuffer = await audioFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const noteTakerAgent = mastraClient.getAgent('salesRolePlayAgent');
  const response = await noteTakerAgent.voice?.listen(new Blob([buffer])) as any;

  const text = response.text?.text || '';

  const messages = [
    {
      role: 'user',
      content: text
    }
  ];

  const res = await noteTakerAgent.generate({messages: messages as any,resourceId: 'salesRolePlayAgent', threadId: 'salesRolePlayAgent'});


  return new Response(JSON.stringify(res.text), {
    headers: { 'Content-Type': 'application/json' },
  });
}
