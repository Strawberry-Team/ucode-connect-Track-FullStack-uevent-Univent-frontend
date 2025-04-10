"use client";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {DialogTitle} from "@/components/ui/dialog";
import {LockKeyhole, Mail, User} from "lucide-react";

interface RegisterFormProps {
    name: string;
    email: string;
    password: string;
    setName: (value: string) => void;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    handleRegister: (e: React.FormEvent) => Promise<void>;
}

export default function RegisterForm({
                                         name,
                                         email,
                                         password,
                                         setName,
                                         setEmail,
                                         setPassword,
                                         handleRegister,
                                     }: RegisterFormProps) {
    return (
        <form
            onSubmit={handleRegister}
            className="p-6 w-full flex flex-col gap-4">
            <div className="flex flex-col gap-4">
                <div className="relative flex items-center gap-2">
                    <div className="absolute left-2">
                        <User className="h-5 w-5 text-muted-foreground"/>
                    </div>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Имя"
                        className="pl-10 w-full"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
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
                <div className="relative flex items-center gap-2">
                    <div className="absolute left-2">
                        <LockKeyhole className="h-5 w-5 text-muted-foreground"/>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Пароль"
                        className="pl-10 w-full"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={!name || !email || !password}
                >
                    Зарегистрироваться
                </Button>
                <div
                    className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
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
            </div>
        </form>
    );
}