"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationList } from "./notification-list";
import { NotificationButtonProps } from "@/types";

export function NotificationButton({ 
    unreadCount = 0, 
    onClick, 
    notifications = [], 
    onUpdate 
}: NotificationButtonProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="h-10 px-4 rounded-full border border-gray-300 hover:bg-accent hover:text-accent-foreground relative"
                    onClick={onClick}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-4">
                <div className="flex flex-col gap-2">
                    <NotificationList notifications={notifications} onUpdate={onUpdate} />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 