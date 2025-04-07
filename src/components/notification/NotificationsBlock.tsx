"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";

interface Notification {
    title: string;
    description: string;
    date: string;
}

interface NotificationsBlockProps {
    notifications: Notification[];
}

export default function NotificationsBlock({ notifications }: NotificationsBlockProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCollapsing, setIsCollapsing] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const [collapsedHeight, setCollapsedHeight] = useState(0); // Высота в свёрнутом состоянии
    const contentRef = useRef<HTMLDivElement>(null);
    const collapsedRef = useRef<HTMLDivElement>(null); // Для свёрнутого состояния

    // Измеряем высоту содержимого
    useEffect(() => {
        const updateHeights = () => {
            if (contentRef.current) {
                const height = contentRef.current.scrollHeight;
                const extraHeight = 35; // Дополнительная высота для отступов
                setContentHeight(height + extraHeight);
            }
            if (collapsedRef.current) {
                const height = collapsedRef.current.scrollHeight;
                const extraHeight = 2;
                setCollapsedHeight(height + extraHeight);
            }
        };

        updateHeights();
        window.addEventListener("resize", updateHeights);

        return () => window.removeEventListener("resize", updateHeights);
    }, [isExpanded, notifications]);

    // Обработчик сворачивания с анимацией
    const handleCollapse = () => {
        setIsCollapsing(true);
        setTimeout(() => {
            setIsExpanded(false);
            setIsCollapsing(false);
        }); // Должно совпадать с duration-500
    };

    if (!notifications || notifications.length === 0) {
        return null;
    }

    const latestNotification = notifications[0];

    return (
        <div className="mt-6 w-[400px]">
            <div
                className="overflow-hidden transition-all duration-500 ease-in-out"
                style={{
                    height: isExpanded || isCollapsing ? `${contentHeight}px` : `${collapsedHeight}px`, // Анимируем между свёрнутым и полным
                }}
            >
                <div ref={contentRef}>
                    {/* Последняя новость всегда видна */}
                    <div className="border-l-2 border-gray-200 pl-3 py-1">
                        <div ref={collapsedRef}>
                            <h4 className="text-base font-medium text-gray-800">{latestNotification.title}</h4>
                            <div
                                className="transition-all duration-500 ease-in-out overflow-hidden"
                                style={{
                                    maxHeight: isExpanded || isCollapsing ? "100px" : "0px", // Оставляем для описания
                                    opacity: isExpanded || isCollapsing ? 1 : 0,
                                }}
                            >
                                <p className="text-gray-600 text-sm mt-1">{latestNotification.description}</p>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-gray-500">
                                <CalendarDays strokeWidth={2.5} className="w-3 h-3" />
                                <span className="text-xs">{latestNotification.date}</span>
                            </div>
                        </div>
                    </div>

                    {/* Остальные новости */}
                    {notifications.slice(1).map((notification, index) => (
                        <div
                            key={index}
                            className="border-l-2 border-gray-200 pl-3 py-1 transition-all duration-500 ease-in-out"
                            style={{
                                opacity: isExpanded || isCollapsing ? 1 : 0,
                            }}
                        >
                            <h4 className="text-base font-medium text-gray-800">{notification.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{notification.description}</p>
                            <div className="flex items-center gap-1 mt-1 text-gray-500">
                                <CalendarDays strokeWidth={2.5} className="w-3 h-3" />
                                <span className="text-xs">{notification.date}</span>
                            </div>
                        </div>
                    ))}

                    {/* Кнопка "Collapse" */}
                    <div
                        className="flex justify-end mt-2 transition-all duration-500 ease-in-out"
                        style={{
                            opacity: isExpanded || isCollapsing ? 1 : 0,
                        }}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                            onClick={handleCollapse}
                        >
                            <ChevronUp className="w-3 h-3" />
                            Collapse
                        </Button>
                    </div>
                </div>
            </div>

            {/* Кнопка "Show More" */}
            {!isExpanded && !isCollapsing && (
                <div className="flex justify-end mt-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                        onClick={() => setIsExpanded(true)}
                    >
                        <ChevronDown className="w-3 h-3" />
                        Show More
                    </Button>
                </div>
            )}
        </div>
    );
}