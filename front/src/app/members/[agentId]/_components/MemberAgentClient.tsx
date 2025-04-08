"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/app/my-agent/_components/ChatInterface";
import Image from "next/image";
import { MemberAgent } from "@/types/agent";

// モックデータ（メインページと同じデータを使用）
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

// IDからエージェントを取得するヘルパー関数
const getMockAgent = (id: string): MemberAgent | undefined => {
  return mockAgents.find(agent => agent.id === id);
};

// クライアントコンポーネントとパラメータを受け取るラッパーコンポーネント
interface MemberAgentClientProps {
  agentId: string;
}

export default function MemberAgentClient({ agentId }: MemberAgentClientProps) {
  const [agent, setAgent] = useState<MemberAgent | null>(null);
  const router = useRouter();

  useEffect(() => {
    const foundAgent = getMockAgent(agentId);
    if (foundAgent) {
      setAgent(foundAgent);
    } else {
      router.push("/members");
    }
  }, [agentId, router]);

  if (!agent) {
    return <div className="container mx-auto p-8">読み込み中...</div>;
  }

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
      <ChatInterface owner={agent.owner} agentId={agentId} />
    </div>
  );
}
