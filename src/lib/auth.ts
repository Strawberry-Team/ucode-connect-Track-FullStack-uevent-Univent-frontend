// /src/lib/auth.ts
export async function login(email: string, password: string): Promise<void> {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка логина");
    }
}

export async function logout(): Promise<void> {
    const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка выхода");
    }
}

// Другие функции (register, refreshToken) остаются без изменений