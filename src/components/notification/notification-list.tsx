"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Clock, Building2, Calendar, Eye, EyeOff, Check, CheckCheck, X, Trash2 } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Notification, NotificationListProps } from "@/types/notification";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { markNotificationAsRead, markNotificationAsHidden } from "@/lib/notifications";
import { useAuth } from "@/context/auth-context";
import { showSuccessToast, showErrorToasts } from "@/lib/toast";
import Link from "next/link";

const formatDate = (dateString: string): string => {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "MMMM d, yyyy") : "Unknown notification date";
};

const formatTime = (dateString: string): string => {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "HH:mm") : "Unknown notification time";
};

export function NotificationList({ notifications: initialNotifications, onUpdate }: NotificationListProps & { onUpdate: () => void }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    useEffect(() => {
        setNotifications(initialNotifications);
    }, [initialNotifications]);

    const handleMarkAsRead = async (notificationId: number) => {
        if (!user) {
            showErrorToasts(["User is not authenticated"]);
            return;
        }

        const result = await markNotificationAsRead(user.id, notificationId);
        if (result.success) {
            showSuccessToast("Notification marked as read");
            onUpdate();
        } else {
            showErrorToasts(result.errors);
        }
    };

    const handleHideNotification = async (notificationId: number) => {
        if (!user) {
            showErrorToasts(["User is not authenticated"]);
            return;
        }

        const result = await markNotificationAsHidden(user.id, notificationId);
        if (result.success) {
            showSuccessToast("Notification hidden successfully");
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            onUpdate();
        } else {
            showErrorToasts(result.errors);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user) {
            showErrorToasts(["User is not authenticated"]);
            return;
        }
        
        const readPromises = notifications.map(notification => 
            markNotificationAsRead(user.id, notification.id)
        );
        const results = await Promise.all(readPromises);

        const hasErrors = results.some(result => !result.success);
        if (!hasErrors) {
            showSuccessToast("All notifications marked as read successfully");
            setNotifications([]);
            onUpdate();
        } else {
            showErrorToasts(["Some notifications could not be marked as read"]);
        }
    };

    const handleHideAllNotifications = async () => {
        if (!user) {
            showErrorToasts(["User is not authenticated"]);
            return;
        }

        const hidePromises = notifications.map(notification => 
            markNotificationAsHidden(user.id, notification.id)
        );
        const results = await Promise.all(hidePromises);
        
        const hasErrors = results.some(result => !result.success);
        if (!hasErrors) {
            showSuccessToast("All notifications hidden successfully");
            setNotifications([]);
            onUpdate();
        } else {
            showErrorToasts(["Some notifications could not be hidden"]);
        }
    };

    if (!notifications || notifications.length === 0) {
        return (
            <div className="text-sm text-muted-foreground py-2 text-center">
                No new notifications
            </div>
        );
    }

    const hasUnreadNotifications = notifications.some(notification => !notification.readAt);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="flex gap-0">
                    {hasUnreadNotifications && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs"
                                        onClick={handleMarkAllAsRead}
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Mark all notifications as read</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {notifications.length > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs"
                                        onClick={handleHideAllNotifications}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Hide all notifications</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-1 max-h-[440px] border-t px-2 py-2 overflow-y-auto custom-scroll">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`p-3 rounded-lg transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md ${
                            Boolean(notification.readAt) ? 'bg-muted/50 hover:bg-muted/80' : 'bg-card hover:bg-card'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 rounded-full">
                                {notification.event ? (
                                    <>
                                        <Calendar strokeWidth={2.5} className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground"/>
                                        {/* <AvatarImage 
                                            src={notification.event.logoName ? 
                                                `/uploads/event-posters/${notification.event.logoName}` : 
                                                undefined
                                            } 
                                            alt={notification.event.title}
                                        /> */}
                                    </>
                                ) : notification.company ? (
                                    <>
                                        <Building2 strokeWidth={2.5} className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                                        {/* <AvatarImage 
                                            src={notification.company.logoName ? 
                                                `/uploads/company-logos/${notification.company.logoName}` : 
                                                undefined
                                            } 
                                            alt={notification.company.title}
                                        /> */}
                                    </>
                                ) : null}
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    {Boolean(notification.readAt) ? (
                                        <h4 className="text-sm font-normal">{notification.title}</h4>
                                    ) : (
                                        <h4 className="text-sm font-medium">{notification.title}</h4>
                                    )}
                                    <div className="flex gap-1">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-6 w-6 hover:bg-accent/80 ${Boolean(notification.readAt) ? 'text-muted-foreground' : ''}`}
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        disabled={Boolean(notification.readAt)}
                                                    >
                                                        {Boolean(notification.readAt) ? (
                                                            <CheckCheck className="h-4 w-4" />
                                                        ) : (
                                                            <Check className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="left">
                                                    <p>{Boolean(notification.readAt) ? "Already read" : "Mark as read"}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 hover:bg-accent/80"
                                                        onClick={() => handleHideNotification(notification.id)}
                                                    >
                                                        <X strokeWidth={2.5} className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="left">
                                                    <p>Hide notification</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {notification.event ? (
                                        <>
                                            {notification.content.split(notification.event.title).map((part, index, array) => {
                                                if (index === array.length - 1) return <span key={`${notification.id}-event-${index}`}>{part}</span>;
                                                return (
                                                    <span key={`${notification.id}-event-${index}`}>
                                                        {part}
                                                        <Link 
                                                            href={`/events/${notification.event?.id}`}
                                                            className="font-medium hover:underline text-foreground"
                                                        >
                                                            {notification.event?.title}
                                                        </Link>
                                                    </span>
                                                );
                                            })}
                                        </>
                                    ) : notification.company ? (
                                        <>
                                            {notification.content.split(notification.company.title).map((part, index, array) => {
                                                if (index === array.length - 1) return <span key={`${notification.id}-company-${index}`}>{part}</span>;
                                                return (
                                                    <span key={`${notification.id}-company-${index}`}>
                                                        {part}
                                                        <Link 
                                                            href={`/companies/${notification.company?.id}`}
                                                            className="font-medium hover:underline text-foreground"
                                                        >
                                                            {notification.company?.title}
                                                        </Link>
                                                    </span>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        notification.content
                                    )}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                    {/* <CalendarDays strokeWidth={2.5} className="h-3 w-3"/> */}
                                    <Clock strokeWidth={2.5} className="h-3 w-3" />
                                    <span>
                                        {formatDate(notification.createdAt)}
                                    </span>
                                    <span className="ml-1">
                                        {formatTime(notification.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 