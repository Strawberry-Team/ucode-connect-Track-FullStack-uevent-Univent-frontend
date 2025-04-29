"use client";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {DialogTitle} from "@/components/ui/dialog";
import {LockKeyhole, Mail, User, Eye, EyeOff} from "lucide-react";
import { RegisterFormProps } from "@/types/auth";

export default function RegisterForm({
    firstName,
    lastName,
    email,
    password,
    setFirstName,
    setLastName,
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
                        id="firstName"
                        type="text"
                        placeholder="Name"
                        className="text-[16px] py-5 px-7 rounded-2xl pl-10 w-full"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div className="relative flex items-center gap-2">
                    <div className="absolute left-3">
                        <User className="h-5 w-5 text-muted-foreground"/>
                    </div>
                    <Input
                        id="lastName"
                        type="text"
                        placeholder="Surname"
                        className="text-[16px] py-5 px-7 rounded-2xl pl-10 w-full"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
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
                    disabled={!firstName || !email || !password}
                >
                    Register
                </Button>
            </div>
        </form>
    );
}