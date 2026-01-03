import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const middleware = auth((req) => {
    const isLoggedIn = !!req.auth;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
        req.nextUrl.pathname.startsWith('/signup');
    const isRootPath = req.nextUrl.pathname === '/';

    if (isAuthPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        return NextResponse.next();
    }

    // Allow root path and share pages without authentication
    if (isRootPath || req.nextUrl.pathname.startsWith('/share')) {
        return NextResponse.next();
    }

    if (!isLoggedIn) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)'],
};
