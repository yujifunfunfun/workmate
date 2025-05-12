import Link from "next/link";


export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { view } = await searchParams;

  // 全アプリケーション一覧（各アプリケーションにカテゴリを追加）
  const allApps = [
    {
      id: "schedule-adjustment",
      name: "スケジュール調整",
      description: "スケジュール調整エージェントです。",
      icon: "🗓️",
      category: "プロジェクト管理",
      isAvailable: true
    },
    {
      id: "sales-case",
      name: "営業事例検索",
      description: "過去の営業成功事例から類似の事例を検索するエージェントです。顧客折衝や提案書作成のサポートを行います。",
      icon: "🏆",
      category: "営業",
      isAvailable: true
    },
    {
      id: "sales-role-play",
      name: "営業ロープレ",
      description: "ロープレシナリオ作成、フィードバック,ロープレと営業成績の相関関係を分析します。",
      icon: "💼",
      category: "営業",
      isAvailable: true
    },
    // {
    //   id: "meeting-minutes",
    //   name: "議事録作成",
    //   description: "会議を録音し、議事録を作成します。",
    //   icon: "📝",
    //   category: "プロジェクト管理",
    //   isAvailable: true
    // },
    {
      id: "product-strategy-planning",
      name: "製品戦略立案",
      description: "製品戦略立案エージェントです。",
      icon: "📊",
      category: "事業開発",
      isAvailable: false
    },
    {
      id: "product-development",
      name: "商品開発",
      description: "企画・製造・物流など専門知識を持ったAIエージェントが議論を進行します。",
      icon: "💡",
      category: "開発",
      isAvailable: false
    },
    {
      id: "legal-contract",
      name: "法務・契約サポート",
      description: "標準契約書の作成と条項説明、契約書レビューと潜在的リスクの特定、法的質問への回答と参考判例の提示ができます。",
      icon: "📝",
      category: "法務",
      isAvailable: false
    },
    {
      id: "data-analysis",
      name: "データ分析",
      description: "社内データの可視化と傾向分析、レポート自動生成と主要指標のハイライト、予測モデルの構築と将来予測を支援します。",
      icon: "📊",
      category: "データ分析",
      isAvailable: false
    },
    {
      id: "marketing-strategy",
      name: "マーケティング戦略",
      description: "ターゲット市場分析と顧客ペルソナ作成、コンテンツ企画と最適な配信チャネル提案、キャンペーンの効果測定を行います。",
      icon: "🎯",
      category: "マーケティング",
      isAvailable: false
    },
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
    <div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayApps.map((app) => (
          app.isAvailable ? (
            <Link
              key={app.id}
              href={`/library/agent/${app.id}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-3xl">{app.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold">{app.name}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 line-clamp-3">
                    {app.description}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div
              key={app.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 opacity-55"
            >
              <div className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-3xl">{app.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold">{app.name}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {app.description}
                  </p>
                </div>

                <p>
                  coming soon...
                </p>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
