import MemberAgentClient from "./_components/MemberAgentClient";


export default async function MemberAgentChatPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  return <MemberAgentClient agentId={agentId} />;
}
