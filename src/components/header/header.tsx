"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import AuthModal from "@/components/auth/auth-modal";
import { useAuth } from "@/context/auth-context";
import { showErrorToasts } from "@/lib/toast";
import { NavUser } from "@/components/user/nav-user";
import { NotificationButton } from "@/components/notifications/notification-button";
import { Notification } from "@/types";
import { getUserNotifications } from "@/lib/notifications";
import { Search, X } from "lucide-react";

export default function Header() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const prevPathnameRef = useRef(pathname);

    const showBorder = pathname !== "/";

    const fetchNotifications = async () => {
        if (isAuthenticated && user) {
            try {
                const response = await getUserNotifications(user.id);
                if (response.success && Array.isArray(response.data)) {
                    const notificationsList = response.data as Notification[];
                    setNotifications(notificationsList);
                    const unreadCount = notificationsList.filter(
                        (notification: Notification) => !notification.readAt
                    ).length;
                    setUnreadNotifications(unreadCount);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
                showErrorToasts("Failed to fetch notifications");
            }
        }
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchNotifications();
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        const prevPathname = prevPathnameRef.current;

        if (prevPathname === "/" && pathname !== "/") {
            setSearchQuery("");
        }

        // Обновляем предыдущий pathname
        prevPathnameRef.current = pathname;
    }, [pathname]);

    const handleNotificationClick = () => {
        fetchNotifications();
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery.trim()) {
            params.set("title", searchQuery.trim());
        } else {
            params.delete("title");
        }
        params.set("page", "1");
        router.push(`/?${params.toString()}`);
    };

    const clearSearch = () => {
        setSearchQuery("");
        const params = new URLSearchParams(searchParams.toString());
        if (params.has("title")) {
            params.delete("title");
            params.set("page", "1");
            router.push(`/?${params.toString()}`);
        }
    };

    return (
        <header
            className={`z-30 px-custom sticky top-0 flex h-[72px] shrink-0 items-center gap-2 bg-background/95 backdrop-blur-md ${
                showBorder ? "border-b" : ""
            }`}
        >
            <div className="flex items-center justify-between gap-4 w-full relative">
                <Link href="/" className="flex items-center gap-2 cursor-pointer">
                    <Avatar className="h-10 w-10 rounded-lg shrink-0">
                        <AvatarImage src="/logo_favicon.png" alt="Логотип" />
                    </Avatar>
                    <span className="text-[20px] font-medium">Calendula</span>
                </Link>

                <div className="flex-1 flex justify-center max-w-2xl relative">
                    <Input
                        type="text"
                        placeholder="Find events..."
                        className="h-10 text-[14px] px-4 pr-20 font-medium w-full rounded-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1"
                            onClick={clearSearch}
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                        onClick={handleSearch}
                    >
                        <Search className="h-5 w-5 text-gray-500" />
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    {isAuthenticated && user ? (
                        <>
                            <NotificationButton
                                unreadCount={unreadNotifications}
                                notifications={notifications}
                                onClick={handleNotificationClick}
                                onUpdate={fetchNotifications}
                            />
                            <NavUser user={user} />
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            className="h-10 px-6 text-[14px] rounded-full font-medium border-gray-300 hover:bg-accent hover:text-accent-foreground"
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