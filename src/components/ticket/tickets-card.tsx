// components/TicketsCard.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedButton from "@/components/ui/animated-button";
import TicketCreateModal from "@/components/ticket/ticket-create-modal";
import { Ticket as TicketIcon, Plus } from "lucide-react";
import { getEventTickets, getEventTicketTypes } from "@/lib/event";
import { showErrorToasts } from "@/lib/toast";
import { TicketsResponse, Ticket, TicketType } from "@/types";

// Типы пропсов
type TicketsInfoCardProps = {
    eventId: number;
};

// Тип для сгруппированных тикетов
type GroupedTicket = {
    title: string;
    price: string;
    totalQuantity: number; // Всего тикетов
    availableQuantity: number; // Доступно тикетов
    soldQuantity: number; // Продано тикетов
    ticketType: TicketType; // Храним оригинальный тип тикета
};

// Функция для форматирования цены
const formatPrice = (price: number): string => {
    return price.toLocaleString("en-US", {
        minimumFractionDigits: 0, // Не показывать дробные части, если их нет
        maximumFractionDigits: 2, // Показывать до 2 знаков после запятой, если есть
    });
};

// Компонент карточки тикетов
export default function TicketsCard({ eventId }: TicketsInfoCardProps) {
    const [ticketsData, setTicketsData] = useState<TicketsResponse | null>(null);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [groupedTickets, setGroupedTickets] = useState<GroupedTicket[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Загрузка тикетов и типов тикетов
    useEffect(() => {
        const fetchTickets = async () => {
            setIsLoading(true);
            const start = Date.now();

            // Получаем все тикеты для подсчета общего количества и проданных
            const ticketsResult = await getEventTickets(eventId);
            // Получаем типы тикетов (доступные)
            const ticketTypesResult = await getEventTicketTypes(eventId);

            if (ticketsResult.success && ticketsResult.data && ticketTypesResult.success && ticketTypesResult.data) {
                setTicketsData(ticketsResult.data);
                setTicketTypes(ticketTypesResult.data.items);

                // Группируем тикеты по title и price для подсчета общего и проданных
                const ticketCounts = ticketsResult.data.items.reduce(
                    (acc: { [key: string]: { total: number; sold: number } }, ticket) => {
                        const key = `${ticket.title}-${ticket.price}`;
                        if (!acc[key]) {
                            acc[key] = { total: 0, sold: 0 };
                        }
                        acc[key].total += 1;
                        if (ticket.status === "sold") {
                            acc[key].sold += 1;
                        }
                        return acc;
                    },
                    {}
                );

                // Создаем сгруппированный массив на основе ticketTypes
                const groupedArray = ticketTypesResult.data.items
                    .map((ticketType) => {
                        const key = `${ticketType.title}-${ticketType.price}`;
                        const ticketCount = ticketCounts[key] || { total: 0, sold: 0 };
                        return {
                            title: ticketType.title,
                            price: formatPrice(ticketType.price), // Форматируем цену
                            totalQuantity: ticketCount.total,
                            availableQuantity: ticketType.count,
                            soldQuantity: ticketCount.sold,
                            ticketType,
                        };
                    })
                    .sort((a, b) => Number(a.price) - Number(b.price));

                setGroupedTickets(groupedArray);
            } else {
                setTicketsData(null);
                setTicketTypes([]);
                setGroupedTickets([]);
                showErrorToasts(ticketsResult.errors || ticketTypesResult.errors || ["Failed to fetch ticket"]);
            }

            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            setIsLoading(false);
        };
        fetchTickets();
    }, [eventId]);

    // Обработчик создания тикета
    const handleTicketCreated = async (newTickets: Ticket[]) => {
        // Обновляем общее количество тикетов
        setTicketsData((prev) => {
            if (!prev) {
                return { items: newTickets, total: newTickets.length };
            }
            return {
                items: [...prev.items, ...newTickets],
                total: prev.total + newTickets.length,
            };
        });

        // Выполняем запрос для получения обновленных типов тикетов
        const ticketTypesResult = await getEventTicketTypes(eventId);

        if (ticketTypesResult.success && ticketTypesResult.data) {
            setTicketTypes(ticketTypesResult.data.items);

            // Группируем новые тикеты для подсчета общего и проданных
            const ticketCounts = [...(ticketsData?.items || []), ...newTickets].reduce(
                (acc: { [key: string]: { total: number; sold: number } }, ticket) => {
                    const key = `${ticket.title}-${ticket.price}`;
                    if (!acc[key]) {
                        acc[key] = { total: 0, sold: 0 };
                    }
                    acc[key].total += 1;
                    if (ticket.status === "sold") {
                        acc[key].sold += 1;
                    }
                    return acc;
                },
                {}
            );

            // Создаем новый сгруппированный массив на основе ticketTypes
            const updatedGroupedArray = ticketTypesResult.data.items
                .map((ticketType) => {
                    const key = `${ticketType.title}-${ticketType.price}`;
                    const ticketCount = ticketCounts[key] || { total: 0, sold: 0 };
                    return {
                        title: ticketType.title,
                        price: formatPrice(ticketType.price),
                        totalQuantity: ticketCount.total,
                        availableQuantity: ticketType.count,
                        soldQuantity: ticketCount.sold,
                        ticketType,
                    };
                })
                .sort((a, b) => Number(a.price) - Number(b.price));

            setGroupedTickets(updatedGroupedArray);
        } else {
            showErrorToasts(ticketTypesResult.errors || ["Failed to fetch updated ticket types"]);
        }
    };

    // Подсчитываем общее количество доступных тикетов для заголовка
    const totalAvailableTickets = groupedTickets.reduce(
        (sum, ticket) => sum + ticket.availableQuantity,
        0
    );

    return (
        <>
            <Card className="flex h-[246px] flex-col shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                    <div className="-mt-2 flex items-center justify-between border-b pb-1 text-xl font-medium text-foreground">
                        <div className="flex items-center">
                            <TicketIcon strokeWidth={2.5} className="mr-2 h-5 w-5 text-gray-500" />
                            Tickets{totalAvailableTickets > 0 ? `: ${totalAvailableTickets}` : ""}
                        </div>
                        {!isLoading && groupedTickets.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setIsModalOpen(true);
                                }}
                            >
                                <div className="flex items-center gap-1 text-[15px]">
                                    <Plus strokeWidth={2.5} className="h-5 w-5" />
                                    Add ticket
                                </div>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="-mt-5 flex-1">
                    {isLoading ? (
                        <div className="max-h-[160px] overflow-y-auto px-3 pt-4 custom-scroll">
                            {Array.from({ length: 1 }).map((_, index) => (
                                <div key={index} className="flex flex-col">
                                    <div className="flex items-center justify-between rounded-lg px-2">
                                        <div className="flex items-center gap-4 rounded-lg py-1">
                                            <div className="mt-1 flex flex-col">
                                                <Skeleton className="h-[24px] w-[150px]" />
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Skeleton className="h-[16px] w-[100px]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : groupedTickets.length > 0 ? (
                        <div className="max-h-[160px] overflow-y-auto px-3 pt-3 pb-3 custom-scroll">
                            {groupedTickets.map((groupedTicket, index) => (
                                <div
                                    key={`${groupedTicket.title}-${groupedTicket.price}`}
                                    className="flex flex-col"
                                >
                                    <div className="flex items-center justify-between rounded-lg px-2 w-full transition-all duration-500 hover:shadow-[0_0_15px_rgba(0,0,0,0.15)]">
                                        <div className="flex items-center gap-4 rounded-lg py-1 transition-all">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <h4
                                                        className="text-[18px] md:text-[20px] font-medium text-gray-800"
                                                        style={{
                                                            maxWidth: "150px",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                        }}
                                                    >
                                                        {groupedTicket.title}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 text-[12px]">
                                                    <span>Total: {groupedTicket.totalQuantity}</span>
                                                    <span>Available: {groupedTicket.availableQuantity}</span>
                                                    <span>Sold: {groupedTicket.soldQuantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[14px] md:text-[16px] font-medium text-gray-800">
                      {groupedTicket.price}$
                    </span>
                                    </div>
                                    {index < groupedTickets.length - 1 && (
                                        <hr
                                            className="my-2"
                                            key={`hr-${groupedTicket.title}-${groupedTicket.price}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <AnimatedButton
                                title="Create ticket"
                                onClick={() => {
                                    setIsModalOpen(true);
                                }}
                                isClicked={isClicked}
                                setIsClicked={setIsClicked}
                                topLeftHover={{ left: 4.5, top: 2.4 }}
                                topRightHover={{ right: 4, top: 2.4 }}
                                bottomLeftHover={{ left: 4.5, bottom: 2.4 }}
                                bottomRightHover={{ right: 4, bottom: 2.4 }}
                                centerPadding={{ left: 4.5, top: 2.4, right: 4, bottom: 2.4 }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <TicketCreateModal
                eventId={eventId}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsClicked(false);
                }}
                onTicketCreated={handleTicketCreated}
            />
        </>
    );
}