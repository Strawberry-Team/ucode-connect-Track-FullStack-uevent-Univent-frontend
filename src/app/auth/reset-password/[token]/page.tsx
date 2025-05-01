"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { changePassword } from "@/lib/auth";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {Eye, EyeOff, LockKeyhole} from "lucide-react";

const passwordSchema = z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" });

const changePasswordSchema = z
    .object({
        newPassword: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export default function ResetPasswordPage() {
    const router = useRouter();
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
    const [isOpen, setIsOpen] = useState(true);

    const toggleNewPasswordVisibility = () => setShowNewPassword((prev) => !prev);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

    const handleClose = () => {
        setIsOpen(false);
        router.push("/");
    };

    useEffect(() => {
        if (!isOpen) {
            setNewPassword("");
            setConfirmPassword("");
            setShowNewPassword(false);
            setShowConfirmPassword(false);
            setErrors({});
        }
    }, [isOpen]);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const changePasswordData = { newPassword, confirmPassword };
        const validation = changePasswordSchema.safeParse(changePasswordData);

        if (!validation.success) {
            const validationErrors = validation.error.flatten().fieldErrors;
            setErrors({
                newPassword: validationErrors.newPassword?.[0],
                confirmPassword: validationErrors.confirmPassword?.[0],
            });

            const errorMessages = Object.values(validationErrors)
                .filter((error): error is string[] => error !== undefined)
                .flatMap((error) => error);
            showErrorToasts(errorMessages);
            return;
        }
        setErrors({});

        if (typeof token !== "string") {
            showErrorToasts("Invalid reset token");
            return;
        }

        const result = await changePassword(token, newPassword);

        if (result.success) {
            showSuccessToast("Password changed successfully");
            handleClose();
        } else {
            showErrorToasts(result.errors);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                className="p-0 border-none rounded-4xl overflow-hidden"
                style={{
                    width: "clamp(300px, 100%, 1000px)",
                    height: "clamp(400px, 100vh - 250px, 600px)",
                    maxWidth: "95%",
                    maxHeight: "75%",
                }}
            >
                <div className="grid md:grid-cols-2 h-full">
                    <div className="relative hidden md:block h-full w-full">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                        />
                    </div>
                    <div className="w-full h-full flex flex-col">
                        <div className="flex flex-col items-center text-center pt-15 px-6">
                            <DialogTitle className="text-2xl font-bold">Change Password</DialogTitle>
                        </div>
                        <div className="flex-1 flex items-center justify-center px-6 pb-35">
                            <form onSubmit={handleChangePassword} className="w-full p-6 space-y-4">
                                <div className="relative flex items-center gap-2">
                                    <div className="absolute left-3">
                                        <LockKeyhole className="h-5 w-5 text-muted-foreground"/>
                                    </div>
                                    <Input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="New Password"
                                        className="text-[16px] py-5 px-7 rounded-2xl pl-10 w-full"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleNewPasswordVisibility}
                                        className="absolute right-3 cursor-pointer"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <div className="relative flex items-center gap-2">
                                    <div className="absolute left-3">
                                        <LockKeyhole className="h-5 w-5 text-muted-foreground"/>
                                    </div>
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        className="text-[16px] py-5 px-7 rounded-2xl pl-10 w-full"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleConfirmPasswordVisibility}
                                        className="absolute right-3 cursor-pointer"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <Button
                                    type="submit"
                                    className="text-[16px] py-5 px-7 rounded-full cursor-pointer w-full"
                                    disabled={!newPassword || !confirmPassword}
                                >
                                    Change Password
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}