"use client";

import { AgentCard } from "./AgentCard";
import { MemberAgent } from "@/types/agent";


interface AgentListProps {
  agents: MemberAgent[];
  emptyMessage?: string;
}

export function AgentList({ agents, emptyMessage = "エージェントが見つかりませんでした。" }: AgentListProps) {
  if (agents.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
