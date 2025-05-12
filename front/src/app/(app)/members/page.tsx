"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FilterHeader } from "./_components/FilterHeader";
import { AgentList } from "./_components/AgentList";
import { MemberAgent } from "@/types/agent";
import { useMemberAgents } from "@/hooks/useMemberAgents";


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

export default function MembersAgentPage() {
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const department = searchParams.get("department") || "";
  const currentPage = Number(searchParams.get("page") || "1");
  const pageSize = 6; // 1ページあたりの表示数

  // APIからメンバーデータを取得
  const { members, pagination, isLoading } = useMemberAgents({
    search,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize
  });

  // APIから取得したメンバーデータをMemberAgent形式に変換
  const transformedAgents: MemberAgent[] = members.map((member, index) => {
    // ランダムではなく常に最初のモックデータを使用
    const mockData = mockAgentData[index];

    // フィルタリング用の部署情報はURLパラメータを優先
    const departmentValue = department || mockData.department;

    return {
      id: member.id,
      username: member.username,
      name: `${member.lastName} ${member.firstName}`,
      owner: `${member.lastName} ${member.firstName}`,
      department: departmentValue,
      description: mockData.description,
      skills: mockData.skills,
      avatarUrl: mockData.avatarUrl
    };
  });

  // ページネーション用のURLを生成する関数
  const getPageUrl = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (page > 1) {
      newParams.set("page", page.toString());
    } else {
      newParams.delete("page");
    }

    return `/members?${newParams.toString()}`;
  };

  // 総ページ数
  const totalPages = pagination ? Math.ceil(pagination.total / pageSize) : 0;

  return (
    <div>
      <FilterHeader
        initialSearch={search}
        initialDepartment={department}
      />

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <AgentList
            agents={transformedAgents}
            emptyMessage="条件に一致するエージェントが見つかりませんでした。"
          />

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {/* 前のページボタン */}
                <Link
                  href={getPageUrl(currentPage - 1)}
                  className={`px-4 py-2 rounded-md inline-flex items-center justify-center ${
                    currentPage <= 1
                      ? "bg-gray-200 text-gray-400 pointer-events-none"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  aria-disabled={currentPage <= 1}
                  tabIndex={currentPage <= 1 ? -1 : undefined}
                >
                  前へ
                </Link>

                {/* ページ番号 */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Link
                    key={page}
                    href={getPageUrl(page)}
                    className={`px-4 py-2 rounded-md inline-flex items-center justify-center ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </Link>
                ))}

                {/* 次のページボタン */}
                <Link
                  href={getPageUrl(currentPage + 1)}
                  className={`px-4 py-2 rounded-md inline-flex items-center justify-center ${
                    currentPage >= totalPages
                      ? "bg-gray-200 text-gray-400 pointer-events-none"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  aria-disabled={currentPage >= totalPages}
                  tabIndex={currentPage >= totalPages ? -1 : undefined}
                >
                  次へ
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
