import useSWR from "swr";
import { Threads } from "./Threads";

type Props = {
  token: string;
}

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

export function MyChatTreads({ token }: Props) {
  const { data: threads = [], error, isLoading } = useSWR(
    token ? [`${process.env.NEXT_PUBLIC_MASTRA_API_URL}/threads`, token] : null,
    ([url, token]) => fetcher(url, token),
    {
      revalidateOnFocus: true,
    }
  );

  return (
    <Threads threads={threads} />
  );
}
