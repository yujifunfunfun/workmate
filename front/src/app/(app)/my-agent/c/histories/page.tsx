'use client'

import useSWR from "swr";
import { useState, useEffect } from "react";
import { Bot } from "lucide-react";


const fetcher = (url: string, token: string) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(res => {
    if (!res.ok) {
      throw new Error('APIリクエストエラー');
    }
    return res.json();
  });

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  useEffect(() => {
    const jwtToken = localStorage.getItem('auth_token');
    setToken(jwtToken);
  }, []);

  const { data = [], error, isLoading } = useSWR(
    token ? [`${process.env.NEXT_PUBLIC_MASTRA_API_URL}/chat/histories/members`, token] : null,
    ([url, token]) => fetcher(url, token),
    {
      revalidateOnFocus: true,
    }
  );

  useEffect(() => {
    if (data.length > 0 && !selectedChat) {
      setSelectedChat(data[0].id);
    }
  }, [data, selectedChat]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  const getLastMessage = (messages: any[]) => {
    if (messages.length === 0) return '';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content || (lastMessage.toolInvocations.length > 0 ? '[ツール使用]' : '');
  };

  const getLastMessageTime = (messages: any[]) => {
    if (messages.length === 0) return '';
    return formatDate(messages[messages.length - 1].createdAt);
  };

  const selectedChatData = data.find((chat: any) => chat.id === selectedChat);

  return (
    <div className="flex h-[calc(100vh-96px)]">
      {/* トークリスト側 */}
      <div className="w-2/9 border-r overflow-y-auto bg-white">
        <div className="p-4 border-b">
          <h2 className="font-bold text-md">チャット履歴</h2>
        </div>
        {data.map((item: any) => (
          <div
            key={item.id}
            className={`p-4  cursor-pointer hover:bg-gray-100/75 ${selectedChat === item.id ? 'bg-gray-100/75' : ''}`}
            onClick={() => setSelectedChat(item.id)}
          >
            <div className="flex justify-between items-center">
              <div className="font-medium">{item.lastName} {item.firstName}</div>
              {/* <div className="text-xs text-gray-500">{getLastMessageTime(item.messages)}</div> */}
            </div>
            <div className="text-sm text-gray-600 truncate mt-1">
              {getLastMessage(item.messages)}
            </div>
          </div>
        ))}
      </div>

      {/* チャット内容側 */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChatData && (
          <>
            <div className="p-4 border-b flex items-center">
              <h2 className="font-bold text-md">{selectedChatData.lastName} {selectedChatData.firstName}</h2>
              <span className="text-sm text-gray-500 ml-2">@{selectedChatData.username}</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-12">
              {selectedChatData.messages.map((message: any) => (
                message.content && message.content.length > 0 && (
                <div
                  key={message.id}
                  className={`mb-10 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] flex gap-2 ${
                      message.role === 'user'
                        ? 'bg-gray-100 text-black rounded-3xl py-3 px-5'
                        : 'py-3 px-0'
                    }`}
                  >
                    <div className="text-md">{message.content}</div>
                  </div>
                </div>
                )
              ))}
            </div>

          </>
        )}
        {!selectedChatData && !isLoading && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            チャットを選択してください
          </div>
        )}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            読み込み中...
          </div>
        )}
      </div>
    </div>
  );
}
