// JWT認証に関連するユーティリティ関数

// クッキーにトークンを設定する関数
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

// クッキーからトークンを取得する関数
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;

  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// クッキーからトークンを削除する関数
const removeCookie = (name: string) => {
  if (typeof window === 'undefined') return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

// JWTトークンをローカルストレージとクッキーに保存
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    // ローカルストレージに保存
    localStorage.setItem('auth_token', token);
    // クッキーにも保存（ミドルウェアでの認証確認用）
    setCookie('auth_token', token);
  }
};

// JWTトークンをローカルストレージとクッキーから取得
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // 優先的にローカルストレージから取得
    const token = localStorage.getItem('auth_token');
    if (token) return token;

    // ローカルストレージになければクッキーから取得
    return getCookie('auth_token');
  }
  return null;
};

// JWTトークンをローカルストレージとクッキーから削除（ログアウト時）
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    removeCookie('auth_token');
  }
};

// ユーザーが認証済みかどうかを確認
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
