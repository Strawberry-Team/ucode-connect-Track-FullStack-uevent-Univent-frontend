"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, Minus, Plus, Ticket, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TicketSelectorProps } from "@/types/ticket";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip } from "@radix-ui/react-tooltip";

const TicketSelector = ({ ticket, onQuantityChange, discountPercent = 0, onReset }: TicketSelectorProps) => {
  const [quantity, setQuantity] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  
  useEffect(() => {
    setIsAvailable(ticket.availableCount > 0);
  }, [ticket.availableCount]);

  const handleIncrement = () => {
    if (quantity < ticket.availableCount) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const newQuantity = value === "" 
        ? 0 
        : Math.min(Math.max(0, parseInt(value, 10)), ticket.availableCount);
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  const handleReset = () => {
    setQuantity(0);
    onQuantityChange(0);
    onReset?.();
  };

  const unitPrice = discountPercent > 0
    ? ticket.price * (1 - (discountPercent / 100))
    : ticket.price;
  const totalPrice = unitPrice * quantity;

  return (
    <div className={`p-4 rounded-lg transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md bg-card ${!isAvailable ? 'opacity-60' : ''}`}>
      <div className="flex flex-row">
        <div className="flex flex-col flex-grow">
          {/* Upper row with name and price */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/100">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1 min-w-50">
                <h4 className="text-lg font-medium">{ticket.name}</h4>
              </div>
            </div>
            {discountPercent > 0 ? (
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-400 line-through">{ticket.price.toFixed(2)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white px-3 rounded-md text-xsbg-primary text-primary-foreground z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance">Initial price</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-5 w-5 text-green-700" />
                      <span className="font-semibold text-green-700">{unitPrice.toFixed(2)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white px-3 rounded-md text-xsbg-primary text-primary-foreground z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance">Discounted price</TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <DollarSign className="h-5 w-5" />
                    <span>{ticket.price.toFixed(2)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white px-3 rounded-md text-xsbg-primary text-primary-foreground z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance">Price per ticket</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Lower row with controls and total price */}
          <div className="flex items-center">
          <div className="min-w-30 flex items-center justify-end">
            <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-500">
                {isAvailable ? `Available: ${ticket.availableCount}` : "Sold Out"}
              </p>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white px-3 rounded-md text-xsbg-primary text-primary-foreground z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance">Available ticket quantity</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-3 w-36 justify-center">
                <Tooltip>
                <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDecrement}
                  disabled={!isAvailable || quantity === 0}
                  className="h-8 w-8"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white px-3 rounded-md text-xsbg-primary text-primary-foreground z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance">Decrease quantity</TooltipContent>
                </Tooltip>

                <Tooltip>
                <TooltipTrigger asChild>
                <Input
                  type="number"
                  min={0}
                  max={ticket.availableCount}
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={!isAvailable}
                  className="w-16 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label={`Quantity for ${ticket.name}: ${quantity}`}
                />
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white px-3 rounded-md text-xsbg-primary text-primary-foreground z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance">Enter ticket quantity</TooltipContent>
                </Tooltip>

                <Tooltip>
                <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleIncrement}
                  disabled={!isAvailable || quantity === ticket.availableCount}
                  className="h-8 w-8"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white px-3 rounded-md text-xsbg-primary text-primary-foreground z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance">Increase quantity</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-30 justify-end">
              <Tooltip>
              <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                <DollarSign className="h-5 w-5" />
                <span>{totalPrice.toFixed(2)}</span>
              </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white px-3 rounded-md text-xsbg-primary text-primary-foreground z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance">Total price per ticket quantity</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <div className="flex items-center justify-end gap-2 min-w-10">
            {quantity > 0 && (
              <Tooltip>
              <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="p-2"
                aria-label="Reset quantity"
              >
                <Trash2 strokeWidth={2.5} className="h-5 w-5 mt-1" />
              </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white px-3 rounded-md text-xsbg-primary text-primary-foreground z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance">Reset quantity</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketSelector; 