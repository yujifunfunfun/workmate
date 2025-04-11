import useSWR from 'swr';
import { getAuthToken } from '@/lib/auth';


export interface MemberAgentsResponse {
  success: boolean;
  members: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
  }[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface UseMemberAgentsOptions {
  limit?: number;
  offset?: number;
  search?: string;
}

const fetcher = async (url: string) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('認証トークンがありません');
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('メンバーエージェントの取得に失敗しました');
  }

  return response.json();
};

export function useMemberAgents(options: UseMemberAgentsOptions = {}) {
  const { limit = 50, offset = 0, search = '' } = options;

  // クエリパラメータを構築
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  if (search) {
    params.append('search', search);
  }

  const url = `${process.env.NEXT_PUBLIC_MASTRA_API_URL}/members/agents?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<MemberAgentsResponse>(url, fetcher);

  return {
    data,
    members: data?.members || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate
  };
}
