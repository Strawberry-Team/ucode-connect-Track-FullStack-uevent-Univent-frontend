"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { showErrorToasts } from "@/lib/toast";
import {getUser, User} from "@/lib/user";
import {NavUser} from "@/components/user/NavUser";

export default function Header() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const { isAuthenticated, setAuthenticated } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            if (isAuthenticated) {
                const result = await getUser();
                if (result.success && result.data) {
                    setUser(result.data);
                } else {
                    showErrorToasts(result.errors);
                    setAuthenticated(false);
                }
            } else {
                setUser(null);
            }
        };

        fetchUser();
    }, [isAuthenticated, setAuthenticated]);

    const showBorder = pathname !== "/";

    return (
        <header
            className={`z-30 px-custom sticky top-0 flex h-17 shrink-0 items-center gap-2 bg-background/95 backdrop-blur-md ${
                showBorder ? "border-b" : ""
            }`}
        >
            <div className="flex items-center justify-between gap-4 w-full relative">
                <Link href="/" className="flex items-center gap-2 cursor-pointer">
                    <Avatar className="h-13 w-13 rounded-lg shrink-0">
                        <AvatarImage src="/logo_favicon.png" alt="Логотип" />
                    </Avatar>
                    <span className="text-[24px] font-medium">Calendula</span>
                </Link>

                <div className="flex-1 flex justify-center">
                    <Input
                        type="text"
                        placeholder="Find events..."
                        className="text-[16px] py-5 px-5 font-medium w-full max-w-md rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <Button
                    variant="outline"
                    className="text-[16px] py-5 px-7 rounded-full font-medium"
                >
                    Create company
                </Button>

                <div>
                    {isAuthenticated && user ? (
                        <NavUser user={user} />
                    ) : (
                        <Button
                            variant="outline"
                            className="text-[16px] py-5 px-7 rounded-full font-medium"
                            onClick={() => setIsLoginModalOpen(true)}
                        >
                            Sign up
                        </Button>
                    )}
                </div>
            </div>

            <AuthModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </header>
    );
}