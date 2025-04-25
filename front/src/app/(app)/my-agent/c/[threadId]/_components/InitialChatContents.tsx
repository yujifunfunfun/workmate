import { useState } from "react";

export const InitialChatContents = () => {
  // タブの状態管理
  const [activeTab, setActiveTab] = useState<"news" | "email" | "schedule">("news");

  // ニュースのモックデータ（画像追加）- 9件に増やす
  const newsItems = [
    {
      id: 1,
      title: "新型スマートフォン発売開始",
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 2,
      title: "国内観光客数が回復傾向",
      imageUrl: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 3,
      title: "新たな健康保険制度が来月から施行",
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 4,
      title: "東京オリンピック関連施設の今後の活用方法が決定",
      imageUrl: "https://images.unsplash.com/photo-1529788295308-1eace6f67388?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 5,
      title: "AIによる業務効率化の成功事例が増加",
      imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 6,
      title: "新たな再生可能エネルギー政策が発表",
      imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 7,
      title: "プロ野球チーム新監督就任が決定",
      imageUrl: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 8,
      title: "大型ショッピングモールが来月オープン予定",
      imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 9,
      title: "新しい教育プログラムが全国で展開開始",
      imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
    },
  ];

  // 未読メールのモックデータ
  const unreadEmails = [
    { id: 1, sender: "山田太郎", subject: "プロジェクト進捗報告", time: "10:30" },
    { id: 2, sender: "営業部", subject: "今月の売上目標達成について", time: "9:45" },
    { id: 3, sender: "システム管理者", subject: "セキュリティアップデートのお知らせ", time: "9:20" },
    { id: 4, sender: "佐藤花子", subject: "ミーティング日程変更のお知らせ", time: "昨日" },
    { id: 5, sender: "人事部", subject: "福利厚生制度の変更について", time: "昨日" },
  ];

  // スケジュールのモックデータ
  const scheduleItems = [
    { id: 1, title: "プロジェクトキックオフミーティング", time: "13:00-14:00", location: "会議室A" },
    { id: 2, title: "クライアントとの商談", time: "15:30-16:30", location: "オンライン" },
    { id: 3, title: "週次チームミーティング", time: "明日 10:00-11:00", location: "会議室B" },
    { id: 4, title: "四半期レビュー準備", time: "明日 14:00-15:00", location: "自席" },
    { id: 5, title: "社内研修: リーダーシップ研修", time: "9/16 13:00-17:00", location: "研修室" },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex space-x-2 mb-5 px-2">
        <button
          className={`cursor-pointer py-2 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
            activeTab === "news"
              ? "bg-black text-white shadow-md"
              : "bg-gray-100"
          }`}
          onClick={() => setActiveTab("news")}
        >
          ニュース
        </button>
        <button
          className={`cursor-pointer py-2 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
            activeTab === "email"
              ? "bg-black text-white shadow-md"
              : "bg-gray-100"
          }`}
          onClick={() => setActiveTab("email")}
        >
          未読メール
        </button>
        <button
          className={`cursor-pointer py-2 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
            activeTab === "schedule"
              ? "bg-black text-white shadow-md"
              : "bg-gray-100"
          }`}
          onClick={() => setActiveTab("schedule")}
        >
          スケジュール
        </button>
      </div>

      {/* タブコンテンツ */}
      <div className="bg-white px-2 flex-1 min-h-0 max-h-[400px] overflow-y-auto">
        {/* ニュースタブ */}
        {activeTab === "news" && (
          <div className="h-full">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {newsItems.map((news) => (
                <li key={news.id} className="flex flex-col overflow-hidden">
                  <div className="relative h-40 w-full overflow-hidden rounded-lg mb-2">
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm line-clamp-2">{news.title}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* メールタブ */}
        {activeTab === "email" && (
          <div className="h-full">
            <ul className="divide-y divide-gray-200">
              {unreadEmails.map((email) => (
                <li key={email.id} className="py-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{email.subject}</p>
                      <p className="text-sm text-gray-600">From: {email.sender}</p>
                    </div>
                    <p className="text-sm text-gray-500">{email.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* スケジュールタブ */}
        {activeTab === "schedule" && (
          <div className="h-full">
            <ul className="divide-y divide-gray-200">
              {scheduleItems.map((schedule) => (
                <li key={schedule.id} className="py-3">
                  <p className="font-medium">{schedule.title}</p>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <p>{schedule.time}</p>
                    <p>{schedule.location}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
