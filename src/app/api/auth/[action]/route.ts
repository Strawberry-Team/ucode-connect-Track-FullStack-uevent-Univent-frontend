// /src/app/api/auth/[action]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const backendUrl = "http://localhost:8080/api/auth";

const cookieOptions = {
    httpOnly: false, // Убираем httpOnly для accessToken, чтобы клиент мог его читать
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
};

const refreshCookieOptions = {
    httpOnly: true, // Оставляем httpOnly для refreshToken
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
};

// Функции handleLogin, handleRegister, handleLogout, handleRefresh остаются почти без изменений
async function handleLogin(body: { email: string; password: string }) {
    const { email, password } = body;
    const response = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        return NextResponse.json({ error: "Ошибка логина" }, { status: response.status });
    }

    const data = await response.json();
    const res = NextResponse.json({ user: data.user });
    res.cookies.set("accessToken", data.accessToken, cookieOptions);
    res.cookies.set("refreshToken", data.refreshToken, refreshCookieOptions);
    return res;
}

// Функция для регистрации
async function handleRegister(body: { email: string; password: string; firstName: string; lastName: string }) {
    const { email, password, firstName, lastName } = body;
    const response = await fetch(`${backendUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
    });

    if (!response.ok) {
        return NextResponse.json({ error: 'Ошибка регистрации' }, { status: response.status });
    }

    return NextResponse.json({ message: 'Регистрация успешна' });
}

// Функция для выхода
async function handleLogout() {
    const res = NextResponse.json({ message: 'Выход успешен' });
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    return res;
}

// Обновляем handleRefresh, чтобы он тоже использовал новые опции
async function handleRefresh(request: NextRequest) {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
        return NextResponse.json({ error: "Нет refresh токена" }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        return NextResponse.json({ error: "Не удалось обновить токен" }, { status: response.status });
    }

    const data = await response.json();
    const res = NextResponse.json({ message: "Токен обновлен" });
    res.cookies.set("accessToken", data.accessToken, cookieOptions);
    return res;
}

export async function POST(request: NextRequest, context: { params: Promise<{ action: string }> }) {
    const params = await context.params;
    const { action } = params;
    const body = await request.json();

    try {
        switch (action) {
            case "login":
                return await handleLogin(body);
            case "register":
                return await handleRegister(body);
            case "logout":
                return await handleLogout();
            case "refresh":
                return await handleRefresh(request);
            default:
                return NextResponse.json({ error: "Неизвестное действие" }, { status: 404 });
        }
    } catch (error) {
        console.error(`Error in /api/auth/${action}:`, error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}