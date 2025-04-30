"use client";

import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
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
    Wallet
} from "lucide-react";
import {format} from "date-fns";
import {OrderDetailsModalProps} from "@/types/order";
import Link from "next/link";

export default function OrderDetailsModal({isOpen, onClose, order}: OrderDetailsModalProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Clock strokeWidth={2.5} className="h-5 w-5 text-yellow-500"/>;
            case "PAID":
                return <CheckCircle strokeWidth={2.5} className="h-5 w-5 text-green-500"/>;
            case "FAILED":
                return <XCircle strokeWidth={2.5} className="h-5 w-5 text-red-500"/>;
            case "REFUNDED":
                return <RefreshCcw strokeWidth={2.5} className="h-5 w-5 text-blue-500"/>;
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="focus:outline-none w-[800px] max-h-[90vh] flex bg-white flex-col p-5 rounded-lg shadow-lg">
                <div className="p-6 border-b">
                    <DialogHeader>
                        <DialogTitle>
                            <span className="px-2 text-xl font-semibold">Order Details</span>
                            {order && (
                                <span className="text-xl font-semibold"> (№ {order.id})</span>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="flex-1 p-6">
                    {!order ? (
                        <p className="text-center text-gray-500">No order data available.</p>
                    ) : (
                        <div className="space-y-4 -mt-3">
                            {/* Order Summary */}
                            <div className="px-2 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-800">Total Amount:</span>
                                    {hasDiscount ? (
                                        <>
                                            <span className="line-through items-center text-gray-400">
                                                <DollarSign className="inline -mt-1 h-4 w-4 text-gray-400"/>
                                                {calculateOriginalTotal().toFixed(2)}
                                            </span>
                                            <span className="text-green-600 ml-2">
                                                <DollarSign className="inline -mt-1 h-4 w-4 text-green-600"/>
                                                {order.totalAmount.toFixed(2)}
                                            </span>
                                        </>
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
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-800">Payment Status:</span>
                                    <div className="flex items-center gap-1">
                                        {getStatusIcon(order.paymentStatus)}
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
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-800">Payment Method:</span>
                                    <span className="text-gray-600">{order.paymentMethod}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-800">Created At:</span>
                                    <span className="text-gray-600">
                                        {format(new Date(order.createdAt), "MMMM d, yyyy HH:mm")}
                                    </span>
                                </div>
                            </div>

                            {order.orderItems.length > 0 && (
                                <div className="space-y-4 px-2 mt-4">
                                    <div
                                        className="px-4 py-2 bg-gray-50 rounded-lg transition-all duration-500 hover:shadow-[0_0_15px_rgba(0,0,0,0.15)] cursor-pointer">
                                        <Link href={`/events/${order.orderItems[0].ticket.event.id}`}
                                              className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Event
                                                Details</h3>
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
                                                        <Calendar strokeWidth={2.5} className="h-4 w-4"/>
                                                        <span>
                                                        {format(
                                                            new Date(order.orderItems[0].ticket.event.startedAt),
                                                            "MMMM d, yyyy HH:mm"
                                                        )}
                                                    </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <MapPin strokeWidth={2.5} className="h-4 w-4"/>
                                                        <span>{order.orderItems[0].ticket.event.venue}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>

                            )}
                            {/* Order Items */}
                            <div className="space-y-4 mt-7">
                                <h3 className="text-lg font-semibold px-2 text-gray-800">Order Items</h3>
                                {order.orderItems.length === 0 ? (
                                    <p className="text-gray-500">No items in this order.</p>
                                ) : (
                                    <div className="max-h-[260px] px-2 overflow-y-auto custom-scroll">
                                        {order.orderItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4 last:mb-0"
                                            >
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Ticket strokeWidth={2.5} className="h-5 w-5 text-gray-500"/>
                                                        <span className="font-semibold text-gray-800">
                                                            {item.ticket.number}
                                                        </span>
                                                        <span
                                                            className="border px-2 rounded-md bg-gray-100 text-gray-700 border-gray-300">
                                                            {item.ticket.title}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        <Wallet strokeWidth={2.5}
                                                                className="inline -mt-1 h-5 w-5 text-gray-500"/>
                                                        {hasDiscount ? (
                                                            <>
                                                                <span className="pl-2 line-through text-gray-400">
                                                                    <DollarSign
                                                                        className="inline -mt-1 h-4 w-4 text-gray-400"/>
                                                                    {item.ticket.price.toFixed(2)}
                                                                </span>
                                                                <span className="text-green-600 ml-2">
                                                                    <DollarSign
                                                                        className="inline -mt-1 h-4 w-4 text-green-600"/>
                                                                    {item.finalPrice.toFixed(2)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="pl-2">
                                                                <DollarSign
                                                                    className="inline -mt-1 h-4 w-4 text-gray-600"/>
                                                                {item.finalPrice.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                    }
                </div>
            </DialogContent>
        </Dialog>
    )
        ;
}