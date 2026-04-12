// frontend/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. IP 추출 로직 강화 (Vercel 특성 반영)
  let ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim(); // 여러 개일 경우 첫 번째 것만 사용
  }
  
  const { pathname } = request.nextUrl;

  // 2. 환경변수 안전하게 읽기
  const bypassIpsStr = process.env.MAINTENANCE_BYPASS_IPS || '';
  const bypassIps = bypassIpsStr ? bypassIpsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  // 3. 점검 모드 로직
  if (
    isMaintenanceMode &&
    !bypassIps.includes(ip) &&
    !pathname.startsWith('/maintenance')
  ) {
    const maintenanceUrl = new URL('/maintenance', request.url);
    return NextResponse.rewrite(maintenanceUrl);
  }

  return NextResponse.next();
}

// 4. Matcher 설정 최적화 (정적 파일 및 시스템 파일을 미들웨어 범위에서 완전히 제외)
export const config = {
  matcher: [
    /*
     * 아래 경로들을 제외한 모든 경로에서 미들웨어 실행
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png, images, robots.txt 등
     */
    '/((?!api|_next/static|_next/image|favicon.ico|favicon.png|images|maintenance|robots.txt).*)',
  ],
};