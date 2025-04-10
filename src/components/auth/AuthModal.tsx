"use client";

import { useState } from "react";
import { login } from "@/lib/auth";
import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import LogoImage from "@/assets/solo.png";
import Image from "next/image";
import LoginForm from "./LoginForm";
import ResetPasswordForm from "./ResetPasswordForm";
import RegisterForm from "./RegisterForm";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [resetEmail, setResetEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [activeTab, setActiveTab] = useState("login");
    const { checkAuth } = useAuth();

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await login(email, password);

        if (result.success) {
            showSuccessToast("Login successful");
            setEmail("");
            setPassword("");
            checkAuth();
            onClose();
        } else {
            showErrorToasts(result.errors);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        showSuccessToast("Password reset link sent (placeholder)");
        setResetEmail("");
        setIsForgotPassword(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        showSuccessToast("Registration successful (placeholder)");
        setName("");
        setEmail("");
        setPassword("");
        setActiveTab("login");
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setEmail("");
        setPassword("");
        setName("");
        setIsForgotPassword(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="p-0 border-none rounded-4xl overflow-hidden"
                style={{
                    width: 'clamp(300px, 100%, 1000px)',
                    height: 'clamp(400px, 100vh - 250px, 600px)',
                    maxWidth: '95%',
                    maxHeight: '75%',
                }}
            >
                <div className="grid md:grid-cols-2 h-full">
                    <div className="relative hidden md:block h-full w-full">
                        <Image
                            src={LogoImage}
                            alt="Logo"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                    </div>
                    <div className="relative w-full h-full flex flex-col">
                        <div className="flex flex-col items-center text-center pt-6">
                            <DialogTitle className="text-2xl font-bold">Welcome</DialogTitle>
                            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full px-6 mt-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="login">
                                        Вход
                                    </TabsTrigger>
                                    <TabsTrigger value="register">
                                        Регистрация
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            <Tabs value={activeTab} className="h-full">
                                <TabsContent value="login" className="h-full">
                                    {!isForgotPassword ? (
                                        <LoginForm
                                            setIsForgotPassword={setIsForgotPassword}
                                            email={email}
                                            password={password}
                                            setEmail={setEmail}
                                            setPassword={setPassword}
                                            showPassword={showPassword}
                                            togglePasswordVisibility={togglePasswordVisibility}
                                            handleSubmit={handleSubmit}
                                        />
                                    ) : (
                                        <ResetPasswordForm
                                            setIsForgotPassword={setIsForgotPassword}
                                            setResetEmail={setResetEmail}
                                            handleResetPassword={handleResetPassword}
                                            resetEmail={resetEmail}
                                        />
                                    )}
                                </TabsContent>
                                <TabsContent value="register" className="h-full">
                                    <RegisterForm
                                        name={name}
                                        email={email}
                                        password={password}
                                        setName={setName}
                                        setEmail={setEmail}
                                        setPassword={setPassword}
                                        handleRegister={handleRegister}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}