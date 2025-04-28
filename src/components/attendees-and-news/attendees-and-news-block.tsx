"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import { updateEventAttendeeVisibility, getEventAttendees } from "@/lib/event";
import { useAuth } from "@/context/auth-context";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { NotificationsBlockProps, NotificationItemProps, Notification, UserNotification } from "@/types/attendees-and-news-block";

function NotificationItem({ notification, isExpanded, isCollapsing, onVisibilityChange, currentUserId }: NotificationItemProps) {
    const descriptionRef = useRef<HTMLDivElement>(null);
    const [descriptionHeight, setDescriptionHeight] = useState(0);
    const [isVisible, setIsVisible] = useState(notification.type === "user" ? notification.isVisible : false);

    useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.style.maxHeight = "none";
            setDescriptionHeight(descriptionRef.current.scrollHeight);
            descriptionRef.current.style.maxHeight = isExpanded || isCollapsing ? `${descriptionHeight}px + 10px` : "0px";
        }
    }, [isExpanded, isCollapsing, descriptionHeight]);

    const handleVisibilityChange = async (checked: boolean) => {
        if (notification.type !== "user") return;

        const newVisibility = checked;
        setIsVisible(newVisibility);

        const response = await updateEventAttendeeVisibility(notification.id, newVisibility);
        if (response.success) {
            onVisibilityChange(notification.id, newVisibility);
            showSuccessToast("Changed visibility successfully");
        } else {
            setIsVisible(!newVisibility);
            showErrorToasts("Failed visibility successfully");
        }
    };

    return (
        <div className="border-l-2 border-gray-200 pl-3 mb-3">
            <div className="flex items-center gap-3">
                {(notification.type === "user" || notification.type === "event") && (
                    <img
                        src={notification.type === "user" ? notification.profilePictureName : notification.avatarUrl}
                        alt={notification.type === "user" ? `${notification.firstName} ${notification.lastName}` : notification.title}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                )}
                <div className="flex-1 flex items-center justify-between">
                    {(notification.type === "news" || notification.type === "companyNews") && (
                        <div>
                            <h4 className="text-base font-medium text-gray-800">{notification.title}</h4>
                            <div
                                ref={descriptionRef}
                                className="transition-all duration-500 ease-in-out overflow-hidden"
                                style={{ maxHeight: isExpanded || isCollapsing ? descriptionHeight : 0, opacity: isExpanded || isCollapsing ? 1 : 0 }}
                            >
                                <p className="text-gray-600 text-sm mt-1">{notification.description}</p>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-gray-500">
                                <CalendarDays strokeWidth={2.5} className="w-3 h-3" />
                                <span className="text-xs">{format(new Date(notification.createdAt), "MMMM d, yyyy HH:mm")}</span>
                            </div>
                        </div>
                    )}
                    {(notification.type === "user" || notification.type === "event") && (
                        <div className="flex-1 flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-medium text-gray-800">
                                    {notification.type === "user" ? `${notification.firstName} ${notification.lastName}` : notification.title}
                                </h4>
                                {notification.type === "event" && (
                                    <div className="flex items-center gap-1 mt-1 text-gray-500">
                                        <CalendarDays strokeWidth={2.5} className="w-3 h-3" />
                                        <span className="text-xs">{format(new Date(notification.createdAt), "MMMM d, yyyy HH:mm")}</span>
                                    </div>
                                )}
                            </div>
                            {notification.type === "user" && notification.userId === currentUserId && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Switch
                                                id={`visibility-${notification.id}`}
                                                checked={isVisible}
                                                onCheckedChange={handleVisibilityChange}
                                                className={`cursor-pointer ${
                                                    isVisible ? "!bg-green-500" : "!bg-gray-400"
                                                } transition-colors duration-200`}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Change visibility of your attendance</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AttendeesAndNewsBlock({ notifications, eventId }: NotificationsBlockProps) {
    const { user } = useAuth();
    const currentUserId = user?.id;

    const [isExpanded, setIsExpanded] = useState(false);
    const [isCollapsing, setIsCollapsing] = useState(false);
    const [collapsedHeight, setCollapsedHeight] = useState(0);
    const [fullHeight, setFullHeight] = useState(0);
    const [notificationsState, setNotificationsState] = useState<Notification[]>(notifications || []);
    const [isLoading, setIsLoading] = useState(!!eventId);
    const [error, setError] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const collapsedRef = useRef<HTMLDivElement>(null);
    const maxHeightPx = 200;

    useEffect(() => {
        async function fetchAttendees() {
            if (!eventId) return;

            setIsLoading(true);
            try {
                const attendeesResponse = await getEventAttendees(eventId);
                if (attendeesResponse.success && attendeesResponse.data) {
                    const userNotifications: UserNotification[] = attendeesResponse.data.map((attendee) => {
                        const pictureUrl = attendee.user.profilePictureName
                            ? `http://localhost:8080/uploads/user-avatars/${attendee.user.profilePictureName}`
                            : "https://via.placeholder.com/150";
                        return {
                            type: "user" as const,
                            id: attendee.id,
                            userId: attendee.userId,
                            firstName: attendee.user.firstName,
                            lastName: attendee.user.lastName || "",
                            profilePictureName: pictureUrl,
                            isVisible: attendee.isVisible,
                        };
                    });
                    setNotificationsState(userNotifications);
                } else {
                    setError("Failed to load attendees 1");
                }
            } catch (err) {
                setError("Failed to load attendees 2");
            } finally {
                setIsLoading(false);
            }
        }

        fetchAttendees();
    }, [eventId]);

    const updateHeights = () => {
        if (collapsedRef.current) {
            setCollapsedHeight(collapsedRef.current.scrollHeight);
        }

        if (contentRef.current) {
            const hiddenElements = contentRef.current.querySelectorAll(".attendees-and-news-hidden");
            hiddenElements.forEach((el) => {
                (el as HTMLElement).style.display = "block";
                (el as HTMLElement).style.opacity = "0";
            });

            setFullHeight(contentRef.current.scrollHeight);

            hiddenElements.forEach((el) => {
                (el as HTMLElement).style.display = isExpanded || isCollapsing ? "block" : "none";
                (el as HTMLElement).style.opacity = isExpanded || isCollapsing ? "1" : "0";
            });
        }
    };

    useEffect(() => {
        updateHeights();
        window.addEventListener("resize", updateHeights);
        return () => window.removeEventListener("resize", updateHeights);
    }, [isExpanded, isCollapsing, notificationsState]);

    useEffect(() => {
        if (isExpanded && contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [isExpanded]);

    useEffect(() => {
        if (notifications) {
            setNotificationsState(notifications);
        }
    }, [notifications]);

    const handleCollapse = () => {
        setIsCollapsing(true);
        setTimeout(() => {
            setIsExpanded(false);
            setIsCollapsing(false);
            updateHeights();
        });
    };

    const handleExpand = () => {
        setIsExpanded(true);
        updateHeights();
    };

    const handleVisibilityChange = (id: number, isVisible: boolean) => {
        setNotificationsState((prevNotifications) =>
            prevNotifications.map((notification) =>
                notification.type === "user" && notification.id === id
                    ? { ...notification, isVisible }
                    : notification
            )
        );
    };

    if (isLoading) {
        return (
            <div className="mt-6 max-w-[300px]">
                <div className="space-y-3">
                    {Array.from({ length: 1 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!notificationsState || notificationsState.length === 0) {
        return null;
    }

    const notificationsToDisplay = notificationsState.filter((notification) => {
        if (notification.type !== "user") return true;
        if (currentUserId && notification.userId === currentUserId) return true;
        return notification.isVisible;
    });

    if (notificationsToDisplay.length === 0) {
        return null;
    }

    const firstNotification = notificationsToDisplay[0];

    let containerWidth: string;
    if (firstNotification.type === "news") {
        containerWidth = "max-w-[850px]";
    } else if (firstNotification.type === "companyNews") {
        containerWidth = "max-w-[600px]";
    } else if (firstNotification.type === "user") {
        containerWidth = "max-w-[300px]";
    } else {
        containerWidth = "max-w-[300px]";
    }

    const isNewsOrCompanyNews = firstNotification.type === "news" || firstNotification.type === "companyNews";
    const buttonWidth = isNewsOrCompanyNews && !isExpanded && !isCollapsing ? "w-[300px]" : containerWidth;
    const effectiveHeight = isExpanded || isCollapsing ? Math.min(fullHeight, maxHeightPx) : collapsedHeight;

    return (
        <div className={`mt-6 ${containerWidth}`}>
            <div className="overflow-hidden transition-all duration-500 ease-in-out" style={{ height: effectiveHeight }}>
                <div ref={contentRef} className={isExpanded || isCollapsing ? "overflow-y-auto custom-scroll" : ""} style={{ maxHeight: maxHeightPx }}>
                    <div ref={collapsedRef}>
                        <NotificationItem
                            notification={firstNotification}
                            isExpanded={isExpanded}
                            isCollapsing={isCollapsing}
                            onVisibilityChange={handleVisibilityChange}
                            currentUserId={currentUserId}
                        />
                    </div>
                    {notificationsToDisplay.slice(1).map((notification, index) => (
                        <div
                            key={notification.type === "user" ? notification.id : index}
                            className="notification-hidden transition-all duration-500 ease-in-out"
                            style={{ opacity: isExpanded || isCollapsing ? 1 : 0, display: isExpanded || isCollapsing ? "block" : "none" }}
                        >
                            <NotificationItem
                                notification={notification}
                                isExpanded={isExpanded}
                                isCollapsing={isCollapsing}
                                onVisibilityChange={handleVisibilityChange}
                                currentUserId={currentUserId}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-2">
                {isExpanded && !isCollapsing ? (
                    <div className={`${containerWidth} flex justify-end`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer flex items-center gap-1 text-gray-600 hover:text-gray-800"
                            onClick={handleCollapse}
                        >
                            <ChevronUp className="w-3 h-3" />
                            Collapse
                        </Button>
                    </div>
                ) : (
                    !isExpanded &&
                    !isCollapsing && (
                        <div className={`${buttonWidth} flex justify-end`}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer flex items-center gap-1 text-gray-600 hover:text-gray-800"
                                onClick={handleExpand}
                            >
                                <ChevronDown className="w-3 h-3" />
                                Show More
                            </Button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}