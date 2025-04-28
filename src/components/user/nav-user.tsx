"use client";

import { LogOut, UserPen } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth";
import { showSuccessToast, showErrorToasts } from "@/lib/toast";
import { useAuth } from "@/context/auth-context";
import { NavUserProps, User } from "@/types/user";
import Link from "next/link";

export function NavUser({ user }: NavUserProps) {
    const { setAuthenticated, setUser } = useAuth();

    const imageUrl = user.profilePictureName
        ? `http://localhost:8080/uploads/user-avatars/${user.profilePictureName}`
        : "https://via.placeholder.com/40x40";

    const handleLogout = async () => {
        const result = await logout();
        setAuthenticated(false);
        setUser(null);
        if (result.success) {
            showSuccessToast("Logout successfully");
        } else {
            showErrorToasts(result.errors);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
                <div className="flex items-center gap-0 cursor-pointer h-10 px-0 rounded-full border border-gray-300 hover:bg-accent hover:text-accent-foreground">
                    <Avatar className="h-10 w-10 rounded-full">
                        <img
                            src={imageUrl}
                            alt={user.firstName}
                            className="h-full w-full object-cover rounded-full"
                        />
                        <AvatarFallback className="rounded-full">
                            {user.firstName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-[14px] leading-tight px-2">
                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="end"
                sideOffset={4}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex flex-col gap-2 px-1 py-1.5 text-left text-sm">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10 rounded-lg">
                                <img
                                    src={imageUrl}
                                    alt={user.firstName}
                                    className="h-full w-full object-cover rounded-lg"
                                />
                                <AvatarFallback className="rounded-lg">
                                    {user.firstName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 leading-tight">
                                <span className="truncate font-medium block">
                                    {user.firstName} {user.lastName}
                                </span>
                                <span className="truncate text-xs py-1 block">{user.email}</span>
                            </div>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                        <UserPen strokeWidth={2.5} className="mr-2 h-4 w-4" />
                        Profile
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut strokeWidth={2.5} className="mr-2 h-4 w-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}