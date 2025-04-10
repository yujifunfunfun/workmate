"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FilterHeader } from "./_components/FilterHeader";
import { AgentList } from "./_components/AgentList";
import { useEffect, useState } from "react";
import { MemberAgent } from "@/types/agent";

// モックデータ
const mockAgents: MemberAgent[] = [
  {
    id: "1",
    name: "鈴木 一郎",
    owner: "鈴木 一郎",
    department: "営業部",
    description: "営業戦略の立案や顧客折衝をサポートします。過去の成功事例に基づいたアドバイスが得意です。",
    skills: ["提案書作成", "顧客分析", "商談準備"],
    avatarUrl: "https://picsum.photos/id/1/100/100"
  },
  {
    id: "2",
    name: "田中 花子",
    owner: "田中 花子",
    department: "マーケティング部",
    description: "マーケティング戦略の立案やSNS運用のサポートを行います。トレンド分析が得意です。",
    skills: ["コンテンツ制作", "SNS分析", "キャンペーン企画"],
    avatarUrl: "https://picsum.photos/id/2/100/100"
  },
  {
    id: "3",
    name: "佐藤 健太",
    owner: "佐藤 健太",
    department: "開発部",
    description: "プログラミングやシステム設計のサポートを行います。バグ解決や効率的なコード実装のアドバイスが得意です。",
    skills: ["コーディング", "テスト自動化", "リファクタリング"],
    avatarUrl: "https://picsum.photos/id/3/100/100"
  },
  {
    id: "4",
    name: "山田 優子",
    owner: "山田 優子",
    department: "人事部",
    description: "採用活動や社員研修のサポートを行います。適切な人材評価と育成計画の提案が得意です。",
    skills: ["面接対策", "研修企画", "評価制度"],
    avatarUrl: "https://picsum.photos/id/4/100/100"
  },
  {
    id: "5",
    name: "伊藤 誠",
    owner: "伊藤 誠",
    department: "経理部",
    description: "予算管理や財務分析のサポートを行います。コスト削減策の提案が得意です。",
    skills: ["財務分析", "予算編成", "経費管理"],
    avatarUrl: "https://picsum.photos/id/5/100/100"
  },
  {
    id: "6",
    name: "渡辺 隆",
    owner: "渡辺 隆",
    department: "カスタマーサポート部",
    description: "顧客対応や問題解決のサポートを行います。クレーム対応のアドバイスが得意です。",
    skills: ["問題解決", "顧客満足度向上", "マニュアル作成"],
    avatarUrl: "https://picsum.photos/id/6/100/100"
  },
  {
    id: "7",
    name: "小林 真理",
    owner: "小林 真理",
    department: "営業部",
    description: "新規顧客開拓と商談進行のサポートを行います。競合分析と差別化提案が得意です。",
    skills: ["新規開拓", "競合分析", "クロージング"],
    avatarUrl: "https://picsum.photos/id/7/100/100"
  },
  {
    id: "8",
    name: "中村 翔太",
    owner: "中村 翔太",
    department: "マーケティング部",
    description: "データに基づくマーケティング戦略の立案をサポートします。KPI設定と効果測定が得意です。",
    skills: ["データ分析", "KPI設定", "A/Bテスト"],
    avatarUrl: "https://picsum.photos/id/8/100/100"
  },
  {
    id: "9",
    name: "加藤 美咲",
    owner: "加藤 美咲",
    department: "開発部",
    description: "UI/UX設計とフロントエンド開発のサポートを行います。ユーザー視点のデザイン提案が得意です。",
    skills: ["UI設計", "プロトタイピング", "フロントエンド開発"],
    avatarUrl: "https://picsum.photos/id/9/100/100"
  },
  {
    id: "10",
    name: "松本 大輔",
    owner: "松本 大輔",
    department: "人事部",
    description: "組織開発と社内コミュニケーションの改善をサポートします。チームビルディングの施策提案が得意です。",
    skills: ["組織開発", "チームビルディング", "社内制度設計"],
    avatarUrl: "https://picsum.photos/id/10/100/100"
  },
  {
    id: "11",
    name: "高橋 恵",
    owner: "高橋 恵",
    department: "経理部",
    description: "税務申告と会計処理のサポートを行います。税制改正の影響分析と対策提案が得意です。",
    skills: ["税務処理", "会計システム", "経営分析"],
    avatarUrl: "https://picsum.photos/id/11/100/100"
  },
  {
    id: "12",
    name: "吉田 豊",
    owner: "吉田 豊",
    department: "カスタマーサポート部",
    description: "カスタマーサポート品質向上と業務効率化をサポートします。サポートプロセスの最適化提案が得意です。",
    skills: ["サポート品質管理", "FAQ作成", "オペレーション改善"],
    avatarUrl: "https://picsum.photos/id/12/100/100"
  }
];

export default function MembersAgentPage() {
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const department = searchParams.get("department") || "";
  const currentPage = Number(searchParams.get("page") || "1");

  const pageSize = 6; // 1ページあたりの表示数

  const [filteredAgents, setFilteredAgents] = useState<MemberAgent[]>(mockAgents);

  // 検索条件でフィルタリングする関数
  const filterAgents = (searchTerm: string, department: string): MemberAgent[] => {
    return mockAgents.filter(agent => {
      const matchesSearch = searchTerm === "" ||
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        agent.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = department === "" || agent.department === department;

      return matchesSearch && matchesDepartment;
    });
  };

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

  // 検索条件が変更されたらフィルタリングを実行
  useEffect(() => {
    setFilteredAgents(filterAgents(search, department));
  }, [search, department]);

  // 現在のページに表示するエージェント
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 総ページ数
  const totalPages = Math.ceil(filteredAgents.length / pageSize);

  return (
    <div className="container mx-auto">

      <FilterHeader
        initialSearch={search}
        initialDepartment={department}
      />

      <AgentList
        agents={paginatedAgents}
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
    </div>
  );
}
