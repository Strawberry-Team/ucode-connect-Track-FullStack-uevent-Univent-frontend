"use client";

import { LogOut } from "lucide-react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
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
import { useAuth } from "@/context/AuthContext";

interface NavUserProps {
    user: {
        firstName: string;
        email: string;
        profilePictureName: string;
    };
}

export function NavUser({ user }: NavUserProps) {
    const { setAuthenticated, setUser } = useAuth();

    const handleLogout = async () => {
        const result = await logout();
        setAuthenticated(false);
        setUser(null);
        if (result.success) {
            showSuccessToast("Logged out successfully");
        } else {
            showErrorToasts(result.errors);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
                <div className="flex items-center gap-2 cursor-pointer">
                    <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarImage
                            src={`http://localhost:8080/profile-pictures/${user.profilePictureName}`}
                            alt={user.firstName}
                        />
                        <AvatarFallback className="rounded-lg">
                            {user.firstName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-[16px] leading-tight">
                        <span className="truncate font-medium">{user.firstName}</span>
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
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage
                                    src={`http://localhost:8080/profile-pictures/${user.profilePictureName}`}
                                    alt={user.firstName}
                                />
                                <AvatarFallback className="rounded-lg">
                                    {user.firstName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 leading-tight">
                                <span className="truncate font-medium block">{user.firstName}</span>
                                <span className="truncate text-xs py-1 block">{user.email}</span>
                            </div>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}