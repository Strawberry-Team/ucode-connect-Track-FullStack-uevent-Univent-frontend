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
            className="pb-35 p-6 w-full flex flex-col gap-4">
            <div className="flex flex-col gap-4">
                <div className="relative flex items-center gap-2">
                    <div className="absolute left-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                        id="reset-email"
                        type="text"
                        placeholder="Email"
                        className="text-[16px] py-5 px-7 rounded-2xl pl-10 w-full"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                    />
                </div>
                <Button
                    type="submit"
                    className="text-[16px] py-5 px-7 rounded-full cursor-pointer w-full"
                    disabled={!resetEmail}
                >
                    Send Reset Link
                </Button>
                <div className="flex items-center justify-center gap-2 w-full">
                    <button
                        type="button"
                        onClick={() => setIsForgotPassword(false)}
                        className="text-sm text-muted-foreground underline-offset-2 hover:underline text-center cursor-pointer"
                    >
                        Back to login
                    </button>
                </div>
            </div>
        </form>
    );
}