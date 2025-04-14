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

  // 全アプリケーション一覧（各アプリケーションにカテゴリを追加）
  const allApps = [
    {
      id: "sales-case",
      name: "営業事例検索エージェント",
      description: "過去の営業成功事例から類似の事例を検索するエージェントです。顧客折衝や提案書作成のサポートを行います。",
      icon: "🏆",
      category: "営業",
      isAvailable: true
    },
    {
      id: "sales-role-play",
      name: "営業ロープレエージェント",
      description: "ロープレシナリオ作成、フィードバック,ロープレと営業成績の相関関係を分析します。",
      icon: "💼",
      category: "営業",
      isAvailable: true
    },
    {
      id: "sales-prospect",
      name: "見込み客電話番号取得エージェント",
      description: "見込み客の電話番号を取得します。",
      icon: "📞",
      category: "営業",
      isAvailable: false
    },
    {
      id: "product-development",
      name: "商品開発エージェント",
      description: "企画・製造・物流など専門知識を持ったAIエージェントが議論を進行します。",
      icon: "💡",
      category: "開発",
      isAvailable: false
    },
    {
      id: "legal-contract",
      name: "法務・契約サポートエージェント",
      description: "標準契約書の作成と条項説明、契約書レビューと潜在的リスクの特定、法的質問への回答と参考判例の提示ができます。",
      icon: "📝",
      category: "法務",
      isAvailable: false
    },
    {
      id: "data-analysis",
      name: "データ分析エージェント",
      description: "社内データの可視化と傾向分析、レポート自動生成と主要指標のハイライト、予測モデルの構築と将来予測を支援します。",
      icon: "📊",
      category: "データ分析",
      isAvailable: false
    },
    {
      id: "marketing-strategy",
      name: "マーケティング戦略エージェント",
      description: "ターゲット市場分析と顧客ペルソナ作成、コンテンツ企画と最適な配信チャネル提案、キャンペーンの効果測定を行います。",
      icon: "🎯",
      category: "マーケティング",
      isAvailable: false
    },
    {
      id: "tech-support",
      name: "製品お問い合わせエージェント",
      description: "製品に関する質問に回答します",
      icon: "💁🏻‍♀️",
      category: "カスタマーサポート",
      isAvailable: false
    },
    {
      id: "research-support",
      name: "リサーチエージェント",
      description: "決算・企業ニュース・部署情報をリサーチし、自社製品の特徴から提案ドラフトを作成します",
      icon: "🔍",
      category: "マーケティング",
      isAvailable: false
    },
    {
      id: "new-business-dev",
      name: "新規事業開発ワークフロー",
      description: "市場機会の特定と分析から始まり、アイデア検証、実行計画作成、プレゼンテーション資料準備までの一連のプロセスを自動化します。",
      steps: ["市場機会分析", "アイデア検証", "実行計画策定", "プレゼン準備"],
      icon: "🚀",
      category: "事業開発",
      isAvailable: false
    },
    {
      id: "customer-response",
      name: "顧客対応プロセスワークフロー",
      description: "問い合わせ内容の分類から始まり、回答候補抽出、パーソナライズされた返信作成、フォローアップまでを効率化します。",
      steps: ["問い合わせ分類", "回答候補抽出", "返信作成", "フォローアップ"],
      icon: "👥",
      category: "カスタマーサポート",
      isAvailable: false
    },
    {
      id: "project-management",
      name: "プロジェクト管理ワークフロー",
      description: "プロジェクト要件の明確化、タスク分解、進捗モニタリング、定例報告資料の自動生成までをサポートします。",
      steps: ["要件明確化", "タスク分解", "進捗モニタリング", "報告資料生成"],
      icon: "📋",
      category: "プロジェクト管理",
      isAvailable: false
    },
    {
      id: "recruitment",
      name: "採用・オンボーディングワークフロー",
      description: "求人要件の明確化から始まり、応募者スクリーニング、面接準備、新入社員オンボーディング計画までの一連のプロセスを自動化します。",
      steps: ["求人要件作成", "応募者評価", "面接準備", "オンボーディング計画"],
      icon: "👤",
      category: "人事",
      isAvailable: false
    }
  ];

  // カテゴリの一覧を作成
  const categories = Array.from(new Set(allApps.map(app => app.category)));
  categories.unshift("全て"); // 「全て」を先頭に追加

  // アクティブなカテゴリの判定
  const activeCategory = view || "全て";

  // カテゴリでフィルタリングしたアプリケーションを取得
  const displayApps = activeCategory === "全て"
    ? allApps
    : allApps.filter(app => app.category === activeCategory);

  return (
    <div className="container">
      {/* セグメントリンク */}
      <div className="flex mb-6 overflow-x-auto pb-2 gap-2">
        {categories.map((category) => (
          <Link
            key={category}
            href={category === "全て" ? "/library" : `/library?view=${category}`}
            className={`py-2 px-3 whitespace-nowrap rounded-lg ${activeCategory === category ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"} text-sm`}
          >
            {category}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayApps.map((app) => (
          <div
            key={app.id}
            className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow ${app.isAvailable ? 'opacity-100' : 'opacity-55'}`}
          >
            <div className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{app.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold">{app.name}</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {app.description}
                </p>
              </div>

              {app.isAvailable ? (
                <Link
                  href={`/library/agent/${app.id}`}
                className="inline-flex items-center text-primary hover:text-primary/80"
              >
                使ってみる
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              ) : (
                <p className="">
                  coming soon...
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
