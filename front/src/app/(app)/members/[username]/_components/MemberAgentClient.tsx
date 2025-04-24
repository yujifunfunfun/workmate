"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MemberAgent } from "@/types/agent";
import { useMember } from "@/hooks/useMember";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberChatInterface } from "./MemberChatInterface";

// モックデータ（department、description、skills、avatarUrl のみ）
const mockAgentData = [
  {
    department: "営業部",
    description: "営業戦略の立案や顧客折衝をサポートします。過去の成功事例に基づいたアドバイスが得意です。",
    skills: ["提案書作成", "顧客分析", "商談準備"],
    avatarUrl: "https://picsum.photos/id/1/100/100"
  },
  {
    department: "マーケティング部",
    description: "マーケティング戦略の立案や顧客折衝をサポートします。過去の成功事例に基づいたアドバイスが得意です。",
    skills: ["マーケティング計画作成", "データ分析"],
    avatarUrl: "https://picsum.photos/id/2/100/100"
  },
];


// クライアントコンポーネントとパラメータを受け取るラッパーコンポーネント
interface MemberAgentClientProps {
  username: string;
}

export default function MemberAgentClient({ username }: MemberAgentClientProps) {
  const router = useRouter();
  const { member, isLoading, isError } = useMember(username);

  // ランダムではなく一貫したモックデータを選択
  const index = username === "testuser3" ? 0 : 1;
  const mockData = mockAgentData[index];

  // エラー発生時はリダイレクト
  useEffect(() => {
    if (isError) {
      router.push("/members");
    }
  }, [isError, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-start gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-grow space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full mt-4" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return <div className="container mx-auto p-8">メンバーが見つかりませんでした</div>;
  }

  // APIデータとモックデータを組み合わせたエージェント情報
  const agent: MemberAgent = {
    id: member.id,
    username: member.username,
    name: `${member.lastName} ${member.firstName}`,
    owner: `${member.lastName} ${member.firstName}`,
    department: mockData.department,
    description: mockData.description,
    skills: mockData.skills,
    avatarUrl: mockData.avatarUrl
  };

  return (
    <div className="container">
      <div className="mb-6 bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-start gap-6">
          <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {agent.avatarUrl ? (
              <Image
                src={agent.avatarUrl}
                alt={`${agent.name}のアバター`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-primary text-primary-foreground text-2xl font-semibold">
                {agent.name[0]}
              </div>
            )}
          </div>

          <div className="flex-grow">
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-gray-600">{agent.owner}さんのエージェント</p>
            <p className="text-gray-600">{agent.department}</p>

            <p className="mt-4 text-gray-700">{agent.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {agent.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <MemberChatInterface owner={agent.owner} username={agent.username} avatarUrl={agent.avatarUrl} userId={member.id} />
    </div>
  );
}
