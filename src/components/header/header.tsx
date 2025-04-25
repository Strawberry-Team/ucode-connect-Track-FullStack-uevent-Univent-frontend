"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import AuthModal from "@/components/auth/auth-modal";
import { useAuth } from "@/context/auth-context";
import { showErrorToasts } from "@/lib/toast";
import { NavUser } from "@/components/user/nav-user";
import { NotificationButton } from "@/components/notifications/notification-button";
import { Notification, NotificationsResponse } from "@/types";
import { getUserNotifications } from "@/lib/notifications";

export default function Header() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();
    const pathname = usePathname();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

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
                console.error('Failed to fetch notifications:', error);
                showErrorToasts('Failed to fetch notifications');
            }
        }
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchNotifications();
        }
    }, [isAuthenticated, user]);

    const handleNotificationClick = () => {
        fetchNotifications();
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

                <div className="flex-1 flex justify-center max-w-2xl">
                    <Input
                        type="text"
                        placeholder="Find events..."
                        className="h-10 text-[14px] px-4 font-medium w-full rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
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