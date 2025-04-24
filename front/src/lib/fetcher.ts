export const fetcher = (url: string) => {
  const jwtToken = localStorage.getItem('auth_token');
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${jwtToken}`
    }
  }).then(res => {
    if (!res.ok) {
      throw new Error('APIリクエストエラー');
    }
    return res.json();
  });
};
