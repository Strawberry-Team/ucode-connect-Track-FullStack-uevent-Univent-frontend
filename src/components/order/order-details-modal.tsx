"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    CalendarDays,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCcw,
    Ticket,
    MapPin,
    Calendar,
    CirclePercent,
    DollarSign,
    Wallet,
    Loader2,
    Download,
    FileScan
} from "lucide-react";
import { format } from "date-fns";
import { OrderDetailsModalProps } from "@/types/order";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { getOrderItemTicket } from '@/lib/orders'; // Импортируем функцию для получения PDF
import { showErrorToasts } from '@/lib/toast';

export default function OrderDetailsModal({ isOpen, onClose, order, isLoading }: OrderDetailsModalProps) {
    const router = useRouter();

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Clock strokeWidth={2.5} className="h-5 w-5 text-white" />;
            case "PAID":
                return <CheckCircle strokeWidth={2.5} className="h-5 w-5 text-white" />;
            case "FAILED":
                return <XCircle strokeWidth={2.5} className="h-5 w-5 text-white" />;
            case "REFUNDED":
                return <RefreshCcw strokeWidth={2.5} className="h-5 w-5 text-white" />;
            default:
                return null;
        }
    };

    const hasDiscount = order?.promoCode && order.promoCode.discountPercent > 0;

    const calculateOriginalTotal = () => {
        if (!hasDiscount || !order?.promoCode) return order?.totalAmount || 0;
        const discountPercent = order.promoCode.discountPercent;
        return order.totalAmount / (1 - discountPercent);
    };

    // Handler to fetch and open the PDF directly
    const handleDownload = async (orderId: number, itemId: number) => {
        try {
            const response = await getOrderItemTicket(orderId, itemId);
            if (response.success && response.data) {
                // Создаём Blob из ответа и открываем PDF в новой вкладке
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                window.URL.revokeObjectURL(url); // Очищаем URL после использования
            } else {
                showErrorToasts(['Failed to load ticket PDF']);
            }
        } catch (error) {
            showErrorToasts(['Error fetching ticket PDF']);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="focus:outline-none w-[800px] max-h-[90vh] flex bg-white flex-col p-5 rounded-lg shadow-lg">
                <div className="p-6 border-b">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <div className="flex items-start gap-2">
                                <span className="text-xl font-semibold">Order{order ? ' #' + order.id.toString() : ''} Details</span>
                                {order && (
                                    <Badge
                                        className={`inline-flex items-center gap-1 text-sm font-semibold uppercase text-white rounded-full ml-3 ${
                                            order.paymentStatus === 'PENDING' ? 'bg-yellow-500' :
                                                order.paymentStatus === 'PAID'    ? 'bg-green-500'  :
                                                    order.paymentStatus === 'FAILED'  ? 'bg-red-500'    : 'bg-blue-500'
                                        }`}
                                    >
                                        {getStatusIcon(order.paymentStatus)}
                                        <span className="ml-1">{order.paymentStatus}</span>
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {order?.paymentStatus === 'PENDING' && (
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const id = order?.id;
                                            if (!id) return;
                                            router.push(`/stripe/payment/${id}`);
                                        }}
                                        className="w-[150px] flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-md font-medium rounded-full mt-2"
                                    >
                                        <Wallet className="h-4 w-4" />
                                        Pay
                                    </Button>
                                )}
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="flex-1 p-6 overflow-y-auto custom-scroll">
                    {isLoading ? (
                        <Loader2 className="h-12 w-12 animate-spin text-gray-500 mx-auto" />
                    ) : !order ? (
                        <p className="text-center text-gray-500 mx-auto">No order data available.</p>
                    ) : (
                        <div className="space-y-4 -mt-3">
                            {/* Order Summary */}
                            <div className="px-2 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-800">Date:</span>
                                    <span className="text-gray-600">
                                        {format(new Date(order.createdAt), "MMMM d, yyyy HH:mm")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-800">Total:</span>
                                    {hasDiscount ? (
                                        <span>
                                            <span className="line-through items-center text-gray-400">
                                                <DollarSign className="inline -mt-1 h-4 w-4 text-gray-400"/>
                                                {calculateOriginalTotal().toFixed(2)}
                                            </span>
                                            <span className="text-green-600 ml-2">
                                                <DollarSign className="inline -mt-1 h-4 w-4 text-green-600"/>
                                                {order.totalAmount.toFixed(2)}
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="text-gray-600">
                                            <DollarSign className="inline h-4 w-4 text-gray-600"/>
                                            {order.totalAmount.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                {hasDiscount && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Promo Code:</span>
                                        <span
                                            className="text-green-600">{(order.promoCode.discountPercent * 100).toFixed(0)}% off</span>
                                    </div>
                                )}
                                {order.paymentStatus !== "PENDING" && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-800">Payment Method:</span>
                                        <span className="text-gray-600">{order.paymentMethod}</span>
                                    </div>
                                )}
                            </div>

                            {order.orderItems.length > 0 && (
                                <div className="space-y-4 mt-6">
                                    {/* Event details */}
                                    <h3 className="text-lg font-semibold px-2 text-gray-800">Event Details</h3>
                                    <div className="p-5 bg-gray-50 rounded-lg transition-all duration-500 hover:shadow-[0_0_15px_rgba(0,0,0,0.15)] cursor-pointer">
                                        <Link href={`/events/${order.orderItems[0].ticket.event.id}`}
                                              className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={
                                                        order.orderItems[0].ticket.event.posterName
                                                            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/event-posters/${order.orderItems[0].ticket.event.posterName}`
                                                            : "https://via.placeholder.com/40"
                                                    }
                                                    alt={order.orderItems[0].ticket.event.title}
                                                    className="w-20 h-20 rounded-md object-cover"
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                    <span className="text-[20px] font-semibold text-gray-800">
                                                        {order.orderItems[0].ticket.event.title}
                                                    </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar strokeWidth={2.5} className="h-4 w-4 flex-shrink-0"/>
                                                        <span>
                                                        {format(
                                                            new Date(order.orderItems[0].ticket.event.startedAt),
                                                            "MMMM d, yyyy HH:mm"
                                                        ) + " - " + format(
                                                            new Date(order.orderItems[0].ticket.event.endedAt),
                                                            "MMMM d, yyyy HH:mm"
                                                        )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <MapPin strokeWidth={2.5} className="h-4 w-4 flex-shrink-0"/>
                                                        <span>{order.orderItems[0].ticket.event.venue}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>

                                    {/* Ticket list */}
                                    <h3 className="text-lg font-semibold px-2 text-gray-800">Tickets</h3>
                                    <div className="px-2 flex">
                                        {/* Ticket rows */}
                                        <div className="flex-1 flex flex-col space-y-4">
                                            {order.orderItems.map((item) => (
                                                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-5 bg-gray-50 rounded-lg">
                                                    {/* Icon and number */}
                                                    <div className="flex items-center gap-3">
                                                        <Ticket strokeWidth={2.5} className="h-5 w-5 text-gray-500"/>
                                                        <span className="font-semibold text-gray-800">{item.ticket.number}</span>
                                                    </div>
                                                    <div className="flex items-center justify-center w-[100px] gap-3">
                                                        <Badge variant="outline" className="flex items-center gap-3 bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-xs truncate">
                                                            {item.ticket.title}
                                                        </Badge>
                                                    </div>
                                                    {/* Price */}
                                                    <div className="flex items-center justify-center w-[100px] gap-3">
                                                        {hasDiscount ? (
                                                            <>
                                                                <div className="flex items-center space-x-1 line-through text-gray-400">
                                                                    <DollarSign className="h-4 w-4 text-gray-400"/>
                                                                    <span>{item.ticket.price.toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1 text-green-600">
                                                                    <DollarSign className="h-4 w-4 text-green-600"/>
                                                                    <span>{item.finalPrice.toFixed(2)}</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex items-center space-x-1 text-gray-600">
                                                                <DollarSign className="h-4 w-4 text-gray-600"/>
                                                                <span>{item.finalPrice.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {order.paymentStatus === "PAID" && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownload(order.id, item.id)} // Вызываем обновленный handleDownload
                                                            className="flex items-center gap-3"
                                                        >
                                                            <FileScan strokeWidth={2.5} className="h-4 w-4"/>
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}