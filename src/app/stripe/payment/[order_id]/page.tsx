"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import PaymentForm from '@/components/payment/payment-form';
import { createPaymentIntent } from '@/lib/payments';
import Head from 'next/head';
import { CreditCard, Shield, AlertCircle, Loader2, Undo2, Wallet, CircleX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {format} from "date-fns";
import { getOrderById } from '@/lib/orders';
import { Order } from '@/types/order';
import { showErrorToasts } from '@/lib/toast';

// Global variable for Stripe Promise
let stripePromise: ReturnType<typeof loadStripe> | null = null;

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const order_id = params.order_id;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<Order | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      if (!order_id || typeof order_id !== 'string') {
        setError('Order ID is missing or invalid.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setClientSecret(null);

      try {
        const response = await createPaymentIntent(Number(order_id));
        if (!response.success || !response.data) {
          //  showErrorToasts('Failed to create payment intent.');
           setError('Failed to create payment intent.');
           return;
        }

        const { clientSecret: cs, publishableKey: pk } = response.data;

        if (!stripePromise && pk) {
          stripePromise = loadStripe(pk);
        }

        if (!cs) {
          setError('Failed to get client secret from server.');
          return;
        }

        const orderDetails = await getOrderById(Number(order_id));

        if (orderDetails.success && orderDetails.data) {
          setOrderData(orderDetails.data);
        }   

        setClientSecret(cs);
      } catch (err: any) {
        console.error('Error initializing payment:', err);
        setError(err.response?.data?.message || 'Failed to load payment details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (order_id) {
      initializePayment();
    }
  }, [order_id]);

  // Stripe Elements options aligned with shadcn/ui
  const options: StripeElementsOptions = {
    clientSecret: clientSecret ?? undefined,
    appearance: {
      theme: 'flat',
      variables: {
        colorPrimary: '#000000', // Black primary actions color
        colorBackground: '#ffffff',
        colorText: '#000000',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        borderRadius: '8px',
        fontSizeBase: '16px',
      },
      rules: {
        '.Tab svg': { fill: '#000000' },
        '.Tab--selected': { borderColor: '#000000', color: '#ffffff' },
        '.Tab--selected svg': { fill: '#ffffff' },
        '.AccordionHeader-icon svg': { fill: '#000000' },
        '.Input': { border: '1px solid #000000', padding: '12px', boxShadow: 'none' },
        '.Input:focus': { borderColor: '#000000', boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.2)' },
        '.Label': { fontWeight: '500', color: '#000000', marginBottom: '8px' },
        '.Error': { color: '#ef4444', marginTop: '8px', fontSize: '14px' },
      },
    },
  };

  return (
      <>
        <Head>
          <title className="text-black">
            <span className="text-black">Checkout | </span>
            <span>{process.env.NEXT_PUBLIC_APP_NAME}</span>
          </title>
          <meta name="description" content={`Checkout and pay for the Order #${order_id}`} />
        </Head>

        <main className="min-h-screen bg-white py-12">
          <div className="container mx-auto max-w-2xl px-4">
            {/* Navigation */}
            <div className="flex justify-between">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="mb-8 flex items-center text-black hover:bg-black hover:text-white transition-colors duration-300"
                >
                  <Undo2 strokeWidth={2.5} className="h-4 w-4 mr-2" />
                  Go back
                </Button>
              </div>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/profile')}
                  className="mb-8 flex items-center text-black hover:bg-black hover:text-white transition-colors duration-300"
                >
                  <Wallet strokeWidth={2.5} className="h-4 w-4 mr-2" />
                  My Orders
                </Button>
              </div>
            </div>

            {/* Order Details */}
            <div className="text-center mb-12 space-y-5 border-b border-gray-200 pb-6">
              <h1 className="text-4xl font-bold text-black flex justify-center items-center">
                {`Order #${order_id}`}
              </h1>
              <h1 className="text-xl font-semibold text-black flex justify-center items-center">
                {orderData ? `of ${format(new Date(orderData.createdAt), 'MMM d, yyyy HH:mm')} for $${orderData.totalAmount.toFixed(2)}` : ''}
              </h1>
              <p className="text-lg text-gray-600 flex justify-center items-center">
                Submit your order and pay
              </p>
            </div>

            {/* Main Content */}
            {loading ? (
                <Card className="border-none shadow-xl rounded-xl bg-gray-50">
                  <CardContent className="p-12 text-center flex flex-col items-center justify-center space-y-6">
                    <div className="flex justify-center">
                      <Loader2 className="h-16 w-16 animate-spin text-black" />
                    </div>
                    <p className="text-lg text-gray-600">Loading payment details...</p>
                  </CardContent>
                </Card>
            ) : error ? (
              <Card className="border-none shadow-xl rounded-xl bg-gray-50">
                <CardContent className="p-12 text-center flex flex-col items-center justify-center space-y-6">
                  <div className="flex justify-center items-center">
                    <CircleX strokeWidth={2.5} className="h-5 w-5 text-black" />
                    <h3 className="ml-2 text-xl font-semibold">
                      Payment Error
                    </h3>
                  </div>
                  <p className="text-base">
                    {error}
                  </p>
                  <Button onClick={() => window.location.reload()} className="mt-4 bg-black text-white hover:bg-gray-800 px-5 py-3 rounded-full text-lg">
                    Refresh Page
                  </Button>
                </CardContent>
              </Card>
            ) : !clientSecret || !stripePromise ? (
                <Card className="border-none shadow-xl rounded-xl bg-gray-50">
                  <CardContent className="p-12 text-center flex flex-col items-center justify-center space-y-6">
                    <div className="flex justify-center items-center">
                      <AlertCircle strokeWidth={2.5} className="h-5 w-5 text-black" />
                      <h3 className="ml-2 text-xl font-semibold">
                        Configuration Error
                      </h3>
                    </div>
                    <p className="text-base">
                      We couldn't initialize the payment form. Please try refreshing the page.
                    </p>
                    <Button onClick={() => window.location.reload()} className="mt-4 bg-black text-white hover:bg-gray-800 px-5 py-3 rounded-full text-lg">
                      Refresh Page
                    </Button>
                  </CardContent>
                </Card>
            ) : (
                <Card className="border-none shadow-xl rounded-xl bg-gray-50">
                  <CardHeader className="border-b border-gray-200 p-6">
                    <CardTitle className="flex items-center text-2xl">
                      <CreditCard className="mr-3 h-6 w-6" />
                      Payment Details
                    </CardTitle>
                    <CardDescription className="text-base">Enter your payment information to complete the order.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-12">
                    <Elements options={options} stripe={stripePromise}>
                      <PaymentForm orderId={Number(order_id)} clientSecret={clientSecret} />
                    </Elements>
                    <div className="mt-8 flex items-center text-sm text-gray-500 justify-center">
                      <Shield className="mr-2 h-5 w-5" />
                      Your payment information is encrypted and secure
                    </div>
                  </CardContent>
                </Card>
            )}
          </div>
        </main>
      </>
  );
};

export default PaymentPage;