import MemberAgentClient from "./_components/MemberAgentClient";

export default async function MemberAgentChatPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <MemberAgentClient username={username} />;
}
