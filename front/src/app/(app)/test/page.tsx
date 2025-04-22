'use client'

import { Thread } from "@/components/assistant-ui/thread";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useState, useEffect, ReactNode } from "react";
import { makeAssistantToolUI } from "@assistant-ui/react";
import { Loader2 } from "lucide-react";


export default function TestPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const jwtToken = localStorage.getItem('auth_token');
    setToken(jwtToken);
  }, []);

  const runtime = useChatRuntime({
    api: `/api/test`,
    headers: {
      Authorization: `Bearer ${token}`
    },
  });

  return (
    <div className="grid h-[81vh]">
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread />
        <FavoriteFoodToolUI />
        <WeatherToolUI />
      </AssistantRuntimeProvider>
    </div>
  );
}


type WebSearchArgs = {
  query: string;
};
type WebSearchResult = {
  title: string;
  description: string;
  url: string;
};
const FavoriteFoodToolUI = makeAssistantToolUI<WebSearchArgs, WebSearchResult>({
  toolName: "favoriteFoodTool",
  render: ({ args, status, result }) => {
    return (
      <div className="p-4 bg-gray-50 border rounded-md mb-4">
        <div className="flex items-center space-x-2 ">
          <span className="font-medium text-gray-800">好きな食べ物を検索中...</span>
          {status.type === 'running' && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
        </div>
      </div>
    );
  },
});



interface FoodResult {
  foods?: string[];
}

const WeatherToolUI = makeAssistantToolUI<WebSearchArgs, WebSearchResult>({
  toolName: "weatherTool",
  render: ({ args, status, result }) => {
    return (
      <div className="p-4 bg-gray-50 border rounded-md mb-4">
        <div className="flex items-center space-x-2 ">
          <span className="font-medium text-gray-800">天気を検索中...</span>
          {status.type === 'running' && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
        </div>
      </div>
    );
  },
});
