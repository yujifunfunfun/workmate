import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function WorkflowLibraryPage() {
  // ワークフローの一覧
  const workflows = [
    {
      id: "new-business-dev",
      name: "新規事業開発ワークフロー",
      description: "市場機会の特定と分析から始まり、アイデア検証、実行計画作成、プレゼンテーション資料準備までの一連のプロセスを自動化します。",
      steps: ["市場機会分析", "アイデア検証", "実行計画策定", "プレゼン準備"],
      icon: "🚀"
    },
    {
      id: "customer-response",
      name: "顧客対応プロセスワークフロー",
      description: "問い合わせ内容の分類から始まり、回答候補抽出、パーソナライズされた返信作成、フォローアップまでを効率化します。",
      steps: ["問い合わせ分類", "回答候補抽出", "返信作成", "フォローアップ"],
      icon: "👥"
    },
    {
      id: "project-management",
      name: "プロジェクト管理ワークフロー",
      description: "プロジェクト要件の明確化、タスク分解、進捗モニタリング、定例報告資料の自動生成までをサポートします。",
      steps: ["要件明確化", "タスク分解", "進捗モニタリング", "報告資料生成"],
      icon: "📋"
    },
    {
      id: "recruitment",
      name: "採用・オンボーディングワークフロー",
      description: "求人要件の明確化から始まり、応募者スクリーニング、面接準備、新入社員オンボーディング計画までの一連のプロセスを自動化します。",
      steps: ["求人要件作成", "応募者評価", "面接準備", "オンボーディング計画"],
      icon: "👤"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* セグメントリンク */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-secondary rounded-lg overflow-hidden">
          <Link 
            href="/library" 
            className="py-2 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium"
          >
            全て
          </Link>
          <Link 
            href="/library/agent" 
            className="py-2 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium"
          >
            エージェント
          </Link>
          <Link 
            href="/library/workflow" 
            className="py-2 px-6 bg-primary text-primary-foreground font-medium"
          >
            ワークフロー
          </Link>
        </div>
      </div>

      {/* ワークフロー */}
      <div className="mb-12">
        <h1 className="text-2xl font-bold mb-6">ワークフロー</h1>
        
        <p className="text-gray-600 mb-8">
          複数のステップを持つ業務プロセスを自動化するワークフローです。ステップごとに適切なエージェントが連携し、一連の作業を効率的に実行します。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <div 
              key={workflow.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{workflow.icon}</div>
                  <h3 className="text-xl font-semibold">{workflow.name}</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {workflow.description}
                </p>
                
                <Link
                  href={`/library/workflow/${workflow.id}`}
                  className="inline-flex items-center text-primary hover:text-primary/80"
                >
                  使ってみる
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
