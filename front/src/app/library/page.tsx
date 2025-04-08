import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";

// メタデータを定義
export const metadata: Metadata = {
  title: "ライブラリ | WorkMate",
  description: "専門エージェントとワークフローのライブラリ",
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { view } = await searchParams;

  // 専門エージェントの一覧
  const specializedAgents = [
    {
      id: "sales-case",
      name: "営業成功事例エージェント",
      description: "過去の営業成功事例から類似の事例を検索するエージェントです。顧客折衝や提案書作成のサポートを行います。",
      icon: "🏆"
    },
    {
      id: "sales-pitch",
      name: "営業ロープレエージェント",
      description: "ロープレシナリオ作成、フィードバック,ロープレと営業成績の相関関係を分析します。",
      icon: "💼"
    },
    {
      id: "sales-prospect",
      name: "見込み客電話番号取得エージェント",
      description: "見込み客の電話番号を取得します。",
      icon: "📞"
    },
    {
      id: "product-development",
      name: "商品開発エージェント",
      description: "企画・製造・物流など専門知識を持ったAIエージェントが議論を進行します。",
      icon: "💡"
    },
    {
      id: "legal-contract",
      name: "法務・契約サポートエージェント",
      description: "標準契約書の作成と条項説明、契約書レビューと潜在的リスクの特定、法的質問への回答と参考判例の提示ができます。",
      icon: "📝"
    },
    {
      id: "data-analysis",
      name: "データ分析エージェント",
      description: "社内データの可視化と傾向分析、レポート自動生成と主要指標のハイライト、予測モデルの構築と将来予測を支援します。",
      icon: "📊"
    },
    {
      id: "marketing-strategy",
      name: "マーケティング戦略エージェント",
      description: "ターゲット市場分析と顧客ペルソナ作成、コンテンツ企画と最適な配信チャネル提案、キャンペーンの効果測定を行います。",
      icon: "🎯"
    },
    {
      id: "tech-support",
      name: "製品お問い合わせエージェント",
      description: "製品に関する質問に回答します",
      icon: "💁🏻‍♀️"
    },
    {
      id: "research-support",
      name: "リサーチエージェント",
      description: "決算・企業ニュース・部署情報をリサーチし、自社製品の特徴から提案ドラフトを作成します",
      icon: "🔍"
    }
  ];

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

  // アクティブなリンクの判定
  const isActive = {
    all: view === 'all' || view === undefined,
    agent: view === 'agent',
    workflow: view === 'workflow'
  };

  const allApps = [
    ...specializedAgents,
    ...workflows
  ];

  const displayApps = view === 'workflow' ? workflows : view === 'agent' ? specializedAgents : allApps;

  return (
    <div className="container">
      {/* セグメントリンク */}
      <div className="flex mb-6">
        <div className="inline-flex bg-secondary rounded-lg overflow-hidden">
          <Link
            href="/library?view=all"
            className={`py-2 px-6 ${isActive.all ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"} font-medium`}
          >
            全て
          </Link>
          <Link
            href="/library?view=agent"
            className={`py-2 px-6 ${isActive.agent ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"} font-medium`}
          >
            エージェント
          </Link>
          <Link
            href="/library?view=workflow"
            className={`py-2 px-6 ${isActive.workflow ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"} font-medium`}
          >
            ワークフロー
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayApps.map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl">{agent.icon}</div>
                <h3 className="text-xl font-semibold">{agent.name}</h3>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {agent.description}
              </p>

              <Link
                href={`/library/agent/${agent.id}`}
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
  );
}
