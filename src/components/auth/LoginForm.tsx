"use client";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Eye, EyeOff, LockKeyhole, Mail} from "lucide-react";

interface LoginFormProps {
    setIsForgotPassword: (value: boolean) => void;
    email: string;
    password: string;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    showPassword: boolean;
    togglePasswordVisibility: () => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
}

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
                <div className="absolute left-2">
                    <Mail className="h-5 w-5 text-muted-foreground"/>
                </div>
                <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    className="pl-10 w-full"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="relative flex flex-col gap-1">
                <div className="relative flex items-center gap-2">
                    <div className="absolute left-2">
                        <LockKeyhole className="h-5 w-5 text-muted-foreground"/>
                    </div>
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Пароль"
                        className="pl-10 w-full"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-2 cursor-pointer"
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
                        Забыли пароль?
                    </button>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={!email || !password}>
                Войти
            </Button>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                </span>
            </div>
            <Button variant="outline" className="w-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                    />
                </svg>
                <span className="sr-only">Login with Google</span>
            </Button>
        </form>
    );
}