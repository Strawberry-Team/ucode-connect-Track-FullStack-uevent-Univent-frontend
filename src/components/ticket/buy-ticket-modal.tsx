"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from 'next/navigation';
import type { MouseEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, RefreshCw, CircleCheck, CirclePercent, AlertCircle } from "lucide-react";
import TicketList from "./ticket-list";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { TicketUniqueType, TicketModalProps } from "@/types/ticket";
import { validateEventPromoCode } from "@/lib/promo-codes";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ticketPurchaseZodSchema } from "@/zod/shemas";
import { createOrder, purchaseTickets } from "@/lib/tickets";
import { OrderCreateRequest } from "@/types/order";

const BuyTicketModal = ({ eventId, eventTitle, eventType, isOpen, onClose }: TicketModalProps) => {
  const router = useRouter();
  const [quantities, setQuantities] = useState<{ [typeId: string]: number }>({});
  const [resetCount, setResetCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<TicketUniqueType[]>([]);
  const [promoCodeInput, setPromoCodeInput] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<number | null>(null);
  const [promoError, setPromoError] = useState<string>("");
  const [promoWarning, setPromoWarning] = useState<string>("");

  const handleQuantitiesChange = useCallback((newQuantities: { [typeId: string]: number }) => {
    setQuantities(newQuantities);
  }, []);

  const handleTicketsLoad = useCallback((loadedTickets: TicketUniqueType[]) => {
    setTickets(loadedTickets);
  }, []);

  const handleClearCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setQuantities({});
  };

  const handleClose = () => {
    setQuantities({});
    onClose();
  };

  const handlePurchase = async () => {
    try {
      const validation = ticketPurchaseZodSchema.safeParse(quantities);

      if (!validation.success) {
        const errors = validation.error.errors.map(err => err.message);
        showErrorToasts(errors);
        return;
      }

      setIsSubmitting(true);

      const createOrderData: OrderCreateRequest = {
        // Include promoCode only if user applied a valid promo
        ...(appliedPromo !== null ? { promoCode: promoCodeInput.trim() } : {}),
        paymentMethod: "STRIPE",
        eventId: Number(eventId),
        items: Object.entries(quantities)
          .filter(([, qty]) => qty > 0)
          .map(([typeId, quantity]) => {
            const ticket = tickets.find(t => t.id === typeId);
            return {
              ticketTitle: ticket?.name ?? 'Test',
              typeId,
              quantity,
            };
          }),
      };

      console.log("createOrderData",createOrderData);

      // TODO: Implement actual purchase API call
      const result = await createOrder(createOrderData);

      if (!result.success) {
        showErrorToasts(result.errors.join(", ") || "Error creating order");
        return;
      }

      const order = result.data;

      // Temporary success simulation
      // await new Promise(resolve => setTimeout(resolve, 1000));

      if (order) {
        router.push(`/stripe/payment/${order.id}`);
        return;
      }

      showSuccessToast("Tickets purchased successfully!");
      handleClose();
    } catch (error) {
      showErrorToasts(["Error purchasing tickets"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPromo = async () => {
    const code = promoCodeInput.trim().toUpperCase();
    setPromoError("");
    setPromoWarning("");
    setAppliedPromo(null);
    if (!code) {
      setPromoWarning("Enter a promo code");
      return;
    }
    try {
      const { success, data, errors } = await validateEventPromoCode({ eventId: Number(eventId), code });
      if (!success || !data) {
        setAppliedPromo(null);
        setPromoError(errors.join(", ") || "Invalid promo code");
        return;
      }
      const discount = data.promoCode?.discountPercent * 100;
      setAppliedPromo(discount);
      showSuccessToast(`Promo code ${code} applied: ${discount}% off`);
    } catch (error) {
      setAppliedPromo(null);
      setPromoError("Error validating promo code");
    }
  };

  const handleResetPromoCode = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    setPromoError("");
  };

  const calculateTotal = () => {
    return tickets.reduce((sum, ticket) => {
      const quantity = quantities[ticket.id] || 0;
      const unitPrice = appliedPromo != null
        ? ticket.price * (1 - (appliedPromo / 100))
        : ticket.price;
      return sum + unitPrice * quantity;
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[800px] h-[90vh] flex flex-col p-5 bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle>
                <span className="text-xl font-normal">Tickets for </span>
                <span className="text-xl font-semibold">"{eventTitle}"</span>
                <span className="text-xl font-normal"> {eventType.toLowerCase()}</span>
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll p-6">
            <TicketList
                eventId={eventId}
                onTicketQuantitiesChange={handleQuantitiesChange}
                onTicketsLoad={handleTicketsLoad}
                discountPercent={appliedPromo ?? 0}
                quantities={quantities}
            />
          </div>
          <div className="border-t p-6">

            {/* Promo Code Input and Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap items-center justify-start gap-2 pb-2 w-full sm:w-auto">
                <Input
                  placeholder="Promo code"
                  value={promoCodeInput}
                  onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                  disabled={isSubmitting}
                  className="h-9 flex-1 sm:flex-none rounded-full w-[250px] min-w-[50px] max-w-[250px] text-[14px]"
                />
                    <Button
                      onClick={handleApplyPromo}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 flex-1 sm:flex-none rounded-full w-[80px]"
                    >
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleResetPromoCode}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 flex-1 sm:flex-none rounded-full w-[80px]"
                    >
                      Reset
                    </Button>
              </div>
            </div>

            {/* Promo Error or Success message */}
            <div className="flex flex-col sm:flex-row gap-1 items-center justify-between">
              <div className="flex flex-wrap items-center justify-start gap-1 p-0 pb-6 w-full sm:w-auto">
                {promoError ? (
                  <Alert variant="default" className="w-full sm:w-auto p-0 mb-4 border-none bg-none text-red-700">
                  <AlertCircle strokeWidth={2.5} className="h-5 w-5 text-red-700" />
                  <AlertDescription className="text-red-700 font-normal">{promoError}</AlertDescription>
                  </Alert>
                ) : promoWarning ? (
                  <Alert variant="default" className="w-full sm:w-auto p-0 mb-4 border-none bg-none text-yellow-700">
                    <AlertCircle strokeWidth={2.5} className="h-5 w-5 text-yellow-700" />
                    <AlertDescription className="text-yellow-700 font-normal">{promoWarning}</AlertDescription>
                  </Alert>
                ) : appliedPromo != null ? (
                  <Alert variant="default" className="w-full sm:w-auto p-0 mb-4 border-none bg-none text-green-700">
                    <CircleCheck strokeWidth={2.5} className="h-5 w-5 text-green-700" />
                    <AlertDescription className="text-green-700 font-normal">Promo code applied: {appliedPromo}% off</AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="default" className="w-full sm:w-auto p-0 mb-4 border-none bg-none text-gray-500">
                    <CirclePercent strokeWidth={2.5} className="h-5 w-5 text-gray-500" />
                    <AlertDescription className="text-gray-500 font-normal">No promo code applied</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Clear Cart, Total and Buy Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCart}
                      disabled={isSubmitting || Object.keys(quantities).length === 0}
                      className="flex items-center gap-2 text-[16px] flex-1 sm:flex-none rounded-full w-[150px]"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear Cart
                    </Button>
              </div>
              <div className="flex items-center gap-8 w-full sm:w-auto">
                <div className="text-lg font-semibold bg-secondary rounded-full py-1 px-5">
                  Total: ${calculateTotal().toFixed(2)}
                </div>
                    <Button
                      onClick={handlePurchase}
                      disabled={isSubmitting || Object.keys(quantities).length === 0}
                      className="flex items-center gap-2 text-[16px] flex-1 sm:flex-none rounded-full w-[150px]"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                      {isSubmitting ? "Processing..." : "Buy"}
                    </Button>
              </div>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyTicketModal;