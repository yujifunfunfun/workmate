import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 認証が必要なルートパス
const protectedRoutes = [
  '/my-agent',
  '/members',
  '/library',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ログインが必要なパスかどうかを確認
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // ログイン済みかどうかをJWTトークンの有無で確認
  const authToken = request.cookies.get('auth_token')?.value;

  // ログイン済みなのにログインページにアクセスした場合はマイエージェントページにリダイレクト
  if (pathname.startsWith('/login') && authToken) {
    return NextResponse.redirect(new URL('/my-agent', request.url));
  }

  // 未ログインで保護されたページにアクセスした場合はログインページにリダイレクト
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    // 認証が必要なパス
    '/my-agent/:path*',
    '/members/:path*',
    '/library/:path*',
    // 認証関連のパス
    '/login',
    '/register',
  ],
};
