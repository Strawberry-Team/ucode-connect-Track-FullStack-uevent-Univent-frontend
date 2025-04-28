"use client";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Eye, EyeOff, LockKeyhole, Mail} from "lucide-react";
import { LoginFormProps } from "@/types/auth";

export default function LoginForm({
    setIsForgotPassword,
    email,
    password,
    setEmail,
    setPassword,
    showPassword,
    togglePasswordVisibility,
    handleSubmit,
}: LoginFormProps) {
    return (
        <form onSubmit={handleSubmit} className="p-6 w-full flex flex-col gap-4">
            <div className="relative flex items-center gap-2">
                <div className="absolute left-3">
                    <Mail className="h-5 w-5 text-muted-foreground"/>
                </div>
                <Input
                    id="email"
                    type="text"
                    placeholder="Email"
                    className="text-[16px] py-5 px-7 rounded-2xl pl-10 w-full"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="relative flex flex-col gap-1">
                <div className="relative flex items-center gap-2">
                    <div className="absolute left-3">
                        <LockKeyhole className="h-5 w-5 text-muted-foreground"/>
                    </div>
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="text-[16px] py-5 px-7 rounded-2xl pl-10 w-full"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 cursor-pointer"
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5 text-muted-foreground"/>
                        ) : (
                            <Eye className="h-5 w-5 text-muted-foreground"/>
                        )}
                    </button>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-sm text-muted-foreground underline-offset-2 hover:underline cursor-pointer"
                    >
                        Forgot your password?
                    </button>
                </div>
            </div>

            <Button type="submit" className="text-[16px] py-5 px-7 rounded-full font-medium cursor-pointer w-full" disabled={!email || !password}>
                Login
            </Button>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                </span>
            </div>
            <Button
                variant="outline"
                className="text-[16px] py-5 px-7 rounded-full font-medium cursor-pointer w-full flex items-center gap-0.5"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    style={{ minWidth: "24px", minHeight: "24px" }} // Гарантируем минимальный размер
                >
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4" // Синий
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.07 7.77 23 12 23z"
                        fill="#34A853" // Зеленый
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z"
                        fill="#FBBC05" // Желтый
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.77 1 4.01 3.93 2.18 7.07L5.84 9.91c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335" // Красный
                    />
                </svg>
                <span>oogle</span>
            </Button>
        </form>
    );
}