import useSWR from 'swr';
import { getAuthToken } from '@/lib/auth';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
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
    throw new Error('ユーザー情報の取得に失敗しました');
  }

  return response.json();
};

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<User>(
    process.env.NEXT_PUBLIC_MASTRA_API_URL + '/users/me',
    fetcher
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate
  };
}
