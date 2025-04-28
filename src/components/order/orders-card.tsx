"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarDays, ShoppingBag, Clock, CheckCircle, XCircle, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/auth-context";
import { getUserOrders } from "@/lib/users";
import { Skeleton } from "@/components/ui/skeleton";
import { Order } from "@/types/order";

export default function OrdersCard() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            setLoading(true);
            const start = Date.now();
            const ordersResponse = await getUserOrders(user.id);

            if (ordersResponse.success && ordersResponse.data) {
                const sortedOrders = ordersResponse.data.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setOrders(sortedOrders);
            } else {
                setOrders([]);
            }

            const elapsed = Date.now() - start;
            const remaining = 300 - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            setLoading(false);
        };

        fetchOrders();
    }, [user]);

    if (!user) return null;

    return (
        <Card className="flex h-[396px] flex-col shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader>
                <div className="-mt-2 flex items-center justify-between border-b pb-1 text-xl font-medium text-foreground">
                    <div className="flex items-center">
                        <ShoppingBag strokeWidth={2.5} className="mr-2 h-5 w-5 text-gray-500" />
                        Orders
                    </div>
                </div>
            </CardHeader>
            <CardContent className="-mt-5 flex-1">
                {loading ? (
                    <div className="px-3 pt-3">
                        {Array.from({ length: 1 }).map((_, index) => (
                            <div key={index} className="flex flex-col">
                                <div className="flex items-center justify-between rounded-lg px-2 py-1">
                                    {/* Левая часть: ID, дата и фотографии */}
                                    <div className="flex items-center gap-2">
                                        {/* ID и дата */}
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="h-[24px] w-[80px]" />
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-[16px] w-[100px]" />
                                            </div>
                                        </div>
                                        {/* Фотографии */}
                                        <div className="pl-1 flex w-[100px] sm:w-[150px]">
                                            <div className="flex -space-x-7">
                                                {Array.from({ length: 3 }).map((_, photoIndex) => (
                                                    <Skeleton
                                                        key={photoIndex}
                                                        className="h-10 w-10 rounded-full"
                                                        style={{ zIndex: 3 - photoIndex }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Правая часть: Статус и цена */}
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1">
                                            <Skeleton className="h-[20px] w-[70px]" />
                                        </div>
                                        <Skeleton className="h-[20px] w-[50px]" />
                                    </div>
                                </div>
                                {/* Полоска между скелетонами */}
                                <div className="my-2">
                                    {index < 1 && <hr className="border-gray-200" />}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : orders.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto overflow-x-hidden px-3 pt-3 custom-scroll">
                        {orders.map((order, index) => (
                            <div key={order.id} className="flex flex-col">
                                <div className="flex items-center justify-between rounded-lg px-2 transition-all duration-500 hover:shadow-[0_0_15px_rgba(0,0,0,0.15)]">
                                    {/* Левая часть: ID, дата и фотографии */}
                                    <div className="flex items-center gap-2 rounded-lg py-1 transition-all max-w-[200px] sm:max-w-[250px] truncate">
                                        {/* ID и дата */}
                                        <div className="flex flex-col max-w-[100px] truncate">
                                            <span className="text-[20px] -mt-1 font-medium text-gray-800 truncate">
                                                № {order.id}
                                            </span>
                                            <div className="flex items-center gap-1 text-gray-500 truncate max-w-full">
                                                <CalendarDays strokeWidth={2.5} className="h-3 w-3 flex-shrink-0" />
                                                <span className="text-[12px] truncate">
                                                    {format(new Date(order.createdAt), "MMMM d, yyyy")}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Фотографии с наложением */}
                                        <div className="pl-1 flex w-[100px] sm:w-[150px]">
                                            <div className="photos-container flex -space-x-7">
                                                {order.orderItems.map((item, index) => (
                                                    <img
                                                        key={item.id}
                                                        src={
                                                            item.ticket.event.posterName
                                                                ? `http://localhost:8080/uploads/event-posters/${item.ticket.event.posterName}`
                                                                : "https://via.placeholder.com/40"
                                                        }
                                                        alt={item.ticket.event.title}
                                                        className="w-10 h-10 rounded-full border-none object-cover transition-all duration-300"
                                                        style={{ zIndex: order.orderItems.length - index }}
                                                        onMouseEnter={(e) => {
                                                            const container = e.currentTarget.closest(".photos-container");
                                                            if (container) {
                                                                container.classList.add("expanded");
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            const container = e.currentTarget.closest(".photos-container");
                                                            if (container) {
                                                                setTimeout(() => {
                                                                    if (!container.matches(":hover")) {
                                                                        container.classList.remove("expanded");
                                                                    }
                                                                }, 50);
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Правая часть: Статус и цена */}
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1">
                                            {order.paymentStatus === "PENDING" && (
                                                <Clock strokeWidth={2.5} className="h-4 w-4 text-yellow-500" />
                                            )}
                                            {order.paymentStatus === "PAID" && (
                                                <CheckCircle strokeWidth={2.5} className="h-4 w-4 text-green-500" />
                                            )}
                                            {order.paymentStatus === "FAILED" && (
                                                <XCircle strokeWidth={2.5} className="h-4 w-4 text-red-500" />
                                            )}
                                            {order.paymentStatus === "REFUNDED" && (
                                                <RefreshCcw strokeWidth={2.5} className="h-4 w-4 text-blue-500" />
                                            )}
                                            <span
                                                className={
                                                    order.paymentStatus === "PENDING"
                                                        ? "text-yellow-500"
                                                        : order.paymentStatus === "PAID"
                                                            ? "text-green-500"
                                                            : order.paymentStatus === "FAILED"
                                                                ? "text-red-500"
                                                                : "text-blue-500"
                                                }
                                            >
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                        <span className="text-[15px] font-semibold">
                                            ${order.totalAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                {/* Полоска между ордерами */}
                                <div className="my-2">
                                    {index < orders.length - 1 && <hr className="border-gray-200" />}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-center text-foreground/60">No orders available.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}