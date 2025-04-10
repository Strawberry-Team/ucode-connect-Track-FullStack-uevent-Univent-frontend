"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { Mail } from "lucide-react";

interface ResetPasswordFormProps {
    setIsForgotPassword: (value: boolean) => void;
    setResetEmail: (value: string) => void;
    handleResetPassword: (e: React.FormEvent) => Promise<void>;
    resetEmail: string;
}

export default function ResetPasswordForm({
                                              setIsForgotPassword,
                                              setResetEmail,
                                              handleResetPassword,
                                              resetEmail,
                                          }: ResetPasswordFormProps) {
    return (
        <form
            onSubmit={handleResetPassword}
            className="p-6 w-full flex flex-col gap-4">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center text-center">
                    <DialogTitle className="text-2xl font-bold">Сброс пароля</DialogTitle>
                    <p className="text-balance text-muted-foreground">
                        Введите email для сброса пароля
                    </p>
                </div>
                <div className="relative flex items-center gap-2">
                    <div className="absolute left-2">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                        id="reset-email"
                        type="email"
                        placeholder="Email"
                        className="pl-10 w-full"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={!resetEmail}
                >
                    Отправить ссылку для сброса
                </Button>
                <div className="flex items-center justify-center gap-2 w-full">
                    <button
                        type="button"
                        onClick={() => setIsForgotPassword(false)}
                        className="text-sm text-muted-foreground underline-offset-2 hover:underline text-center cursor-pointer"
                    >
                        Назад
                    </button>
                </div>
            </div>
        </form>
    );
}