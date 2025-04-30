"use client";

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { StripePaymentElementOptions } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface PaymentFormProps {
  orderId: number;
  clientSecret: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ orderId, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.log('Stripe.js has not loaded yet.');
      setIsLoading(false);
      setErrorMessage('Payment system is not ready. Please wait a moment and try again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    console.log(`Attempting to confirm payment for order ${orderId}`);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/confirmation/${orderId}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      console.error('Stripe confirmPayment error:', error);
      setErrorMessage(error.message || 'An unexpected payment error occurred.');
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      console.log('Payment succeeded immediately (no redirect). Redirecting to confirmation...');
      router.push(`/orders/confirmation/${orderId}?status=processing`);
    } else {
      console.warn('Unexpected state after confirmPayment without redirect:', paymentIntent);
      setErrorMessage('Payment processing started. If you are not redirected, please check your order status.');
      setIsLoading(false);
    }
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement id="payment-element" options={paymentElementOptions} />
        {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
        )}
        <Button
            type="submit"
            disabled={isLoading || !stripe || !elements}
            className="w-full"
        >
          {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </div>
          ) : (
              <div className="flex items-center">
                Pay Now
                <Lock className="ml-2 h-4 w-4" />
              </div>
          )}
        </Button>
      </form>
  );
};

export default PaymentForm;