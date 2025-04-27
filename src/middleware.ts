import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/profile'];

const protectedEditRoutes = [
    '/events/[id]/edit',
    '/companies/[id]/edit',
];

const matchesDynamicRoute = (pathname: string, routePattern: string): boolean => {
    const regexPattern = `^${routePattern.replace('[id]', '[^/]+')}$`;
    return !!pathname.match(new RegExp(regexPattern));
};

export async function middleware(request: NextRequest) {
    const accessToken = request.cookies.get('accessToken')?.value || null;
    const pathname = request.nextUrl.pathname;

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    const isProtectedEditRoute = protectedEditRoutes.some((route) =>
        matchesDynamicRoute(pathname, route)
    );

    if (!accessToken && (isProtectedRoute || isProtectedEditRoute)) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};