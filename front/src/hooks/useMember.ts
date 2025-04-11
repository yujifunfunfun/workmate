import useSWR from 'swr';
import { getAuthToken } from '@/lib/auth';

export interface Member {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
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
    throw new Error('メンバー情報の取得に失敗しました');
  }
  
  return response.json();
};

export function useMember(username: string) {
  const { data, error, isLoading, mutate } = useSWR<Member>(
    username ? `${process.env.NEXT_PUBLIC_MASTRA_API_URL}/members/${username}` : null,
    fetcher
  );
  
  return {
    member: data,
    isLoading,
    isError: error,
    mutate
  };
} 
