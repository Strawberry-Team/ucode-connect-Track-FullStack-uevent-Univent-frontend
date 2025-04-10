"use client";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {DialogTitle} from "@/components/ui/dialog";
import {LockKeyhole, Mail, User, Eye, EyeOff} from "lucide-react";

interface RegisterFormProps {
    name: string;
    surname: string;
    email: string;
    password: string;
    setName: (value: string) => void;
    setSurname: (value: string) => void;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    showPassword: boolean;
    togglePasswordVisibility: () => void;
    handleRegister: (e: React.FormEvent) => Promise<void>;
}

export default function RegisterForm({
                                         name,
                                         surname,
                                         email,
                                         password,
                                         setName,
                                         setSurname,
                                         setEmail,
                                         setPassword,
                                         showPassword,
                                         togglePasswordVisibility,
                                         handleRegister,
                                     }: RegisterFormProps) {
    return (
        <form
            onSubmit={handleRegister}
            className="pb-0 p-6 w-full flex flex-col gap-4"
        >
            <div className="flex flex-col gap-4">
                <div className="relative flex items-center gap-2">
                    <div className="absolute left-3">
                        <User className="h-5 w-5 text-muted-foreground"/>
                    </div>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Name"
                        className="text-[16px] py-5 px-7 rounded-2xl pl-10 w-full"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="relative flex items-center gap-2">
                    <div className="absolute left-3">
                        <User className="h-5 w-5 text-muted-foreground"/>
                    </div>
                    <Input
                        id="surname"
                        type="text"
                        placeholder="Surname"
                        className="text-[16px] py-5 px-7 rounded-2xl pl-10 w-full"
                        required
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                    />
                </div>
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
                <Button
                    type="submit"
                    className="text-[16px] py-5 px-7 rounded-full cursor-pointer w-full"
                    disabled={!name || !email || !password}
                >
                    Register
                </Button>
                <div
                    className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"
                >
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
                        style={{ minWidth: "24px", minHeight: "24px" }}
                    >
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.07 7.77 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.77 1 4.01 3.93 2.18 7.07L5.84 9.91c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    <span>oogle</span>
                </Button>
            </div>
        </form>
    );
}