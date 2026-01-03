import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('authjs.session-token') || 
                  request.cookies.get('__Secure-authjs.session-token');
    
    const isLoggedIn = !!token;
    const { pathname } = request.nextUrl;
    
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isRootPath = pathname === '/';
    const isSharePage = pathname.startsWith('/share');
    
    // Redirect logged-in users away from auth pages
    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Allow access to root, share pages, and auth pages without login
    if (isRootPath || isSharePage || isAuthPage) {
        return NextResponse.next();
    }
    
    // Redirect non-logged-in users to login
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)'],
};
