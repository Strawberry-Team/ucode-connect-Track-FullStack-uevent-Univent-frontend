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
        <form onSubmit={handleSubmit} className="pb-25 p-6 w-full flex flex-col gap-4">
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
        </form>
    );
}