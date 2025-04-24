"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";

interface NewsNotification {
    type: "news";
    title: string;
    description: string;
    createdAt: string;
}

interface UserNotification {
    type: "user";
    firstName: string;
    lastName: string;
    createdAt: string;
    avatarUrl: string;
}

// Новые типы уведомлений
interface CompanyNewsNotification {
    type: "companyNews";
    title: string;
    description: string;
    createdAt: string;
}

interface EventNotification {
    type: "event";
    title: string;
    createdAt: string; // Дата события
    avatarUrl: string; // URL фотографии
}

// Обновляем объединённый тип Notification
type Notification = NewsNotification | UserNotification | CompanyNewsNotification | EventNotification;

interface NotificationsBlockProps {
    notifications: Notification[];
}

function NotificationItem({ notification, isExpanded, isCollapsing }: { notification: Notification; isExpanded: boolean; isCollapsing: boolean }) {
    const descriptionRef = useRef<HTMLDivElement>(null);
    const [descriptionHeight, setDescriptionHeight] = useState(0);

    useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.style.maxHeight = "none";
            setDescriptionHeight(descriptionRef.current.scrollHeight);
            descriptionRef.current.style.maxHeight = isExpanded || isCollapsing ? `${descriptionHeight}px + 10px` : "0px";
        }
    }, [isExpanded, isCollapsing, descriptionHeight]);

    return (
        <div className="border-l-2 border-gray-200 pl-3 mb-3">
            <div className="flex items-center gap-3">
                {/* Отображаем фото для типов "user" и "event" */}
                {(notification.type === "user" || notification.type === "event") && (
                    <img
                        src={notification.type === "user" ? notification.avatarUrl : notification.avatarUrl}
                        alt={notification.type === "user" ? `${notification.firstName} ${notification.lastName}` : notification.title}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                )}
                <div>
                    {/* Обработка для типов с описанием: "news" и "companyNews" */}
                    {(notification.type === "news" || notification.type === "companyNews") && (
                        <>
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
                        </>
                    )}
                    {/* Обработка для типов без описания: "user" и "event" */}
                    {(notification.type === "user" || notification.type === "event") && (
                        <>
                            <h4 className="text-base font-medium text-gray-800">
                                {notification.type === "user" ? `${notification.firstName} ${notification.lastName}` : notification.title}
                            </h4>
                            <div className="flex items-center gap-1 mt-1 text-gray-500">
                                <CalendarDays strokeWidth={2.5} className="w-3 h-3" />
                                <span className="text-xs">
                                    {notification.type === "user"
                                        ? format(new Date(notification.createdAt), "MMMM d, yyyy HH:mm")
                                        : format(new Date(notification.createdAt), "MMMM d, yyyy HH:mm")}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AttendeesAndNewsBlock({ notifications }: NotificationsBlockProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCollapsing, setIsCollapsing] = useState(false);
    const [collapsedHeight, setCollapsedHeight] = useState(0);
    const [fullHeight, setFullHeight] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const collapsedRef = useRef<HTMLDivElement>(null);
    const maxHeightPx = 200;

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
    }, [isExpanded, isCollapsing, notifications]);

    useEffect(() => {
        if (isExpanded && contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [isExpanded]);

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

    if (!notifications || notifications.length === 0) return null;

    const firstNotification = notifications[0];

    // Определяем ширину контейнера в зависимости от типа уведомления
    let containerWidth: string;
    if (firstNotification.type === "news") {
        containerWidth = "max-w-[850px]"; // Ширина для новостей события
    } else if (firstNotification.type === "companyNews") {
        containerWidth = "max-w-[600px]"; // Другая ширина для новостей компании
    } else if (firstNotification.type === "user") {
        containerWidth = "max-w-[300px]"; // Ширина для пользователей
    } else {
        containerWidth = "max-w-[300px]"; // Другая ширина для событий (event)
    }

    const isNewsOrCompanyNews = firstNotification.type === "news" || firstNotification.type === "companyNews";
    const buttonWidth = isNewsOrCompanyNews && !isExpanded && !isCollapsing ? "w-[300px]" : containerWidth;
    const effectiveHeight = isExpanded || isCollapsing ? Math.min(fullHeight, maxHeightPx) : collapsedHeight;

    return (
        <div className={`mt-6 ${containerWidth}`}>
            <div className="overflow-hidden transition-all duration-500 ease-in-out" style={{ height: effectiveHeight }}>
                <div ref={contentRef} className={isExpanded || isCollapsing ? "overflow-y-auto custom-scroll" : ""} style={{ maxHeight: maxHeightPx }}>
                    <div ref={collapsedRef}>
                        <NotificationItem notification={firstNotification} isExpanded={isExpanded} isCollapsing={isCollapsing} />
                    </div>
                    {notifications.slice(1).map((notification, index) => (
                        <div
                            key={index}
                            className="notification-hidden transition-all duration-500 ease-in-out"
                            style={{ opacity: isExpanded || isCollapsing ? 1 : 0, display: isExpanded || isCollapsing ? "block" : "none" }}
                        >
                            <NotificationItem notification={notification} isExpanded={isExpanded} isCollapsing={isCollapsing} />
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