"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarDays, ShoppingBag, Clock, CheckCircle, XCircle, RefreshCcw, Wallet, Dot } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/auth-context";
import { getUserOrders } from "@/lib/users";
import { getOrderById } from "@/lib/orders";
import { Skeleton } from "@/components/ui/skeleton";
import { Order } from "@/types/order";
import OrderDetailsModal from "./order-details-modal";
import { showErrorToasts } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";

export default function OrdersCard() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const router = useRouter();

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

    const handleOrderClick = async (orderId: number) => {
        setModalLoading(true);
        setIsModalOpen(true);
        try {
            const response = await getOrderById(orderId);
            if (response.success && response.data) {
                setSelectedOrder(response.data);
            } else {
                showErrorToasts([`Failed to load order ${orderId}`]);
                setIsModalOpen(false);
            }
        } catch (error) {
            showErrorToasts(["Error fetching order details"]);
            setIsModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Clock strokeWidth={2.5} className="h-5 w-5 text-white"/>;
            case "PAID":
                return <CheckCircle strokeWidth={2.5} className="h-5 w-5 text-white"/>;
            case "FAILED":
                return <XCircle strokeWidth={2.5} className="h-5 w-5 text-white"/>;
            case "REFUNDED":
                return <RefreshCcw strokeWidth={2.5} className="h-5 w-5 text-white"/>;
            default:
                return null;
        }
    };

    if (!user) return null;

    return (
        <>
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
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1">
                                                    <Skeleton className="h-[24px] w-[100px]" />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Skeleton className="h-[16px] w-[80px]" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-[20px] w-[70px]" />
                                            </div>
                                            <Skeleton className="h-[20px] w-[50px]" />
                                        </div>
                                    </div>
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
                                    <div className="grid grid-rows-2 [grid-template-columns:auto_1fr] gap-1 p-3 rounded-md transition-all duration-500 hover:shadow-xl cursor-pointer"
                                         onClick={() => handleOrderClick(order.id)}
                                    >
                                        {/* Poster spans two rows */}
                                        {order.orderItems.length > 0 && (
                                            <div className="row-span-2 w-12 h-12 rounded-lg object-cover flex-shrink-0 mr-2">
                                            <img
                                                src={order.orderItems[0].ticket.event.posterName
                                                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/event-posters/${order.orderItems[0].ticket.event.posterName}`
                                                    : "https://via.placeholder.com/40"}
                                                alt={order.orderItems[0].ticket.event.title}
                                                className="row-span-2 w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                            />
                                            </div>
                                        )}
                                        {/* First row: ID, status, price */}
                                        <div className="flex items-center justify-between col-start-2 h-5">
                                            <div className="flex items-center justify-start">
                                                <span className="text-lg font-medium text-balck">#{order.id}</span>
                                                <span className="ml-1 text-xs p-0">{` of ${format(new Date(order.createdAt), "MMMM d, yyyy")}`}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Badge className={`text-white rounded-full ${
                                                    order.paymentStatus === 'PENDING' ? 'bg-yellow-500' :
                                                    order.paymentStatus === 'PAID'    ? 'bg-green-500'  :
                                                    order.paymentStatus === 'FAILED'  ? 'bg-red-500'    : 'bg-blue-500'
                                                }`}>
                                                    {getStatusIcon(order.paymentStatus)}
                                                    <span className="ml-1 text-xs font-semibold uppercase">{order.paymentStatus}</span>
                                                </Badge>
                                            </div>
                                        </div>
                                        {/* Second row: date, tickets, Pay */}
                                        <div className="flex items-center justify-between col-start-2 h-5">
                                            <div className="flex items-start justify-start gap-1 text-gray-500">
                                                <span className="text-xs flex items-center flex-row">
                                                    <span className="mr-1">{order.orderItems.length}</span>
                                                    <span className="mr-1">{order.orderItems.length === 1 ? 'ticket' : 'tickets'}</span>
                                                    {/* <Dot strokeWidth={2.5} className="h-3 w-3"/> */}
                                                </span>
                                                <div className="flex items-center text-xs">
                                                    <span className="mr-1">for</span>
                                                    <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            {order.paymentStatus === 'PENDING' && (
                                                <div className="flex items-center">
                                                    <Button
                                                        onClick={(e) => { e.stopPropagation(); router.push(`/stripe/payment/${order.id}`); }}
                                                        className="flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-full"
                                                        size={null}
                                                    >
                                                        <Wallet className="h-4 w-4" />
                                                        Pay
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {index < orders.length - 1 && <hr className="border-gray-200 mt-2" />}
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
            <OrderDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                order={selectedOrder}
                isLoading={modalLoading}
            />
        </>
    );
}