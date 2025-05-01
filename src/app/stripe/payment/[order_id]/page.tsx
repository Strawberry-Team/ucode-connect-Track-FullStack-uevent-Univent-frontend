"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import PaymentForm from '@/components/payment/payment-form';
import Link from 'next/link';
import { createPaymentIntent } from '@/lib/payments';
import Head from 'next/head';
import { CreditCard, ArrowLeft, CheckCircle, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

// Global variable for Stripe Promise
let stripePromise: ReturnType<typeof loadStripe> | null = null;

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const order_id = params.order_id;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

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
          throw new Error('Failed to create payment intent.');
        }

        const { clientSecret: cs, publishableKey: pk } = response.data;

        if (!stripePromise && pk) {
          stripePromise = loadStripe(pk);
        }

        if (!cs) {
          throw new Error('Client Secret not received from backend.');
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
        colorPrimary: '#10b981', // New primary actions color (green-500)
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        borderRadius: '8px',
        fontSizeBase: '16px',
      },
      rules: {
        '.Tab svg': { fill: '#374151' },
        '.Tab--selected': { borderColor: '#000000', color: '#ffffff' },
        '.Tab--selected svg': { fill: '#ffffff' },
        '.AccordionHeader-icon svg': { fill: '#374151' },
        '.Input': { border: '1px solid #000000', padding: '12px', boxShadow: 'none' },
        '.Input:focus': { borderColor: '#000000', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)' },
        '.Label': { fontWeight: '500', color: '#6f6f6f', marginBottom: '8px' },
        '.Error': { color: '#ef4444', marginTop: '8px', fontSize: '14px' },
      },
    },
  };

  return (
      <>
        <Head>
          <title>Complete Payment | uevent</title>
          <meta name="description" content="Complete your payment for your event tickets" />
        </Head>

        <main className="min-h-screen dark:bg-gray-950 py-12">
          <div className="container mx-auto max-w-2xl px-4">
            {/* Navigation */}
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-8 flex items-center dark:text-gray-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Event
            </Button>

            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex justify-center items-center">
                Complete Your Payment
                <CreditCard className="h-12 w-12 px-2 bg-gray-200 rounded-full ml-2 mt-1" />
              </h1>
              <p className="mt-2 text-[18px] text-gray-600 dark:text-gray-400">
                Order <span className="font-medium">#{order_id}</span>
              </p>
            </div>

            {/* Main Content */}
            {loading ? (
                <Card className="border-none shadow-lg bg-gray-100 dark:bg-gray-800">
                  <CardContent className="pt-8 text-center">
                    <div className="flex justify-center mb-4">
                      <Loader2 className="h-12 w-12 animate-spin" />
                    </div>
                    <p className="mt-3 text-gray-600 dark:text-gray-400">Preparing payment...</p>
                  </CardContent>
                </Card>
            ) : error ? (
                <Card className="border-none shadow-lg bg-gray-50 dark:bg-gray-800">
                  <CardContent className="py-8 text-center">
                    <div className="flex justify-center mb-4">
                      <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50">
                      <AlertTitle className="text-lg font-semibold text-red-700 dark:text-red-300">
                        Payment Error
                      </AlertTitle>
                      <AlertDescription className="justify-center text-red-600 dark:text-red-400 items-center">
                        {error}
                      </AlertDescription>
                    </Alert>
                    <Button asChild className="mt-6">
                      <Link href="/profile">View My Orders</Link>
                    </Button>
                  </CardContent>
                </Card>
            ) : !clientSecret || !stripePromise ? (
                <Card className="border-none shadow-lg bg-gray-50 dark:bg-gray-800">
                  <CardContent className="pt-8 text-center">
                    <div className="flex justify-center mb-4">
                      <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50">
                      <AlertTitle className="text-lg font-semibold text-red-700 dark:text-red-300">
                        Configuration Error
                      </AlertTitle>
                      <AlertDescription className="text-red-600 dark:text-red-400 items-center">
                        We couldn't initialize the payment form. Please try refreshing the page.
                      </AlertDescription>
                    </Alert>
                    <Button onClick={() => window.location.reload()} className="mt-6">
                      Refresh Page
                    </Button>
                  </CardContent>
                </Card>
            ) : (
                <Card className="border-none shadow-lg bg-gray-50 dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Payment Details
                    </CardTitle>
                    <CardDescription>Enter your payment information to complete the order.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Elements options={options} stripe={stripePromise}>
                      <PaymentForm orderId={Number(order_id)} clientSecret={clientSecret} />
                    </Elements>
                    <div className="mt-6 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Shield className="mr-2 h-4 w-4" />
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