"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  Loader2,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import {getOrderById} from '@/lib/orders';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';

const POLLING_INTERVAL = 3000; // 3 seconds
const POLLING_TIMEOUT = 120000; // 2 minutes
const MAX_POLLING_ATTEMPTS = 40; // Максимальна кількість спроб (2 хвилини з інтервалом в 3 секунди)

const OrderConfirmationPage: React.FC = () => {
const router = useRouter();
const params = useParams();
const order_id = params.order_id;
const redirect_status = params.redirect_status;
const orderId = Array.isArray(order_id) ? order_id[0] : order_id;
const [loading, setLoading] = useState(true);
const [orderStatus, setOrderStatus] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
const [orderDetails, setOrderDetails] = useState<any>(null);
const intervalRef = useRef<NodeJS.Timeout | null>(null);
const timeoutRef = useRef<NodeJS.Timeout | null>(null);
const pollingAttemptsRef = useRef<number>(0);
const sessionIdRef = useRef<string | null>(null);
const paymentIntentIdRef = useRef<string | null>(null);

// Get URL parameters
const [urlParams, setUrlParams] = useState<{
    redirect_status: string | null,
    payment_intent: string | null,
    payment_intent_client_secret: string | null,
    status: string | null,
    session: string | null
}>({
    redirect_status: null,
    payment_intent: null,
    payment_intent_client_secret: null,
    status: null,
    session: null
});

useEffect(() => {
    // Отримуємо параметри з URL при першому завантаженні
    if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const params = {
            redirect_status: searchParams.get('redirect_status'),
            payment_intent: searchParams.get('payment_intent'),
            payment_intent_client_secret: searchParams.get('payment_intent_client_secret'),
            status: searchParams.get('status'),
            session: searchParams.get('session')
        };
        setUrlParams(params);

        // Зберігаємо важливі ідентифікатори
        if (params.payment_intent) paymentIntentIdRef.current = params.payment_intent;
        if (params.session) sessionIdRef.current = params.session;

        console.log('URL parameters detected:', params);
    }
}, []);

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    const checkOrderStatus = async (): Promise<boolean> => {
      if (!orderId || typeof orderId !== 'string') {
        setError('Invalid Order ID in URL.');
        setLoading(false);
        return true;
      }

      try {
        const attemptNumber = pollingAttemptsRef.current + 1;
        console.log(`[Attempt ${attemptNumber}/${MAX_POLLING_ATTEMPTS}] Checking order status for ${orderId}...`);
        if (paymentIntentIdRef.current) {
          console.log(`Associated payment intent: ${paymentIntentIdRef.current}`);
        }
        if (sessionIdRef.current) {
          console.log(`Session ID: ${sessionIdRef.current}`);
        }

        // Step 6: Request current status
        const response = await getOrderById(Number(orderId));

        const currentStatus = response.data?.paymentStatus;
        console.log(`Received order status: ${currentStatus}`);
        setOrderStatus(currentStatus ?? null);
        setOrderDetails(response);

        // Check if status is final
        const isFinalStatus = ['PAID', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(currentStatus ?? '');
        if (isFinalStatus) {
          console.log(`Final status reached: ${currentStatus}`);
          setLoading(false);
          clearTimers();
        }

        // Інкрементуємо лічильник спроб
        pollingAttemptsRef.current += 1;

        // Якщо досягнуто максимальної кількості спроб, але статус ще не фінальний
        if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS && !isFinalStatus) {
          console.warn(`Maximum polling attempts (${MAX_POLLING_ATTEMPTS}) reached without final status.`);
          setError('Verification timeout. Please check your order status in "My Orders".');
          setLoading(false);
          clearTimers();
          return true;
        }

        return isFinalStatus;

      } catch (err: any) {
        console.error('Error checking order status:', err);
        // Show error only on first load, otherwise polling will just stop
        if (loading) setError(err.response?.data?.message || 'Could not verify payment status.');
        setLoading(false);
        clearTimers();
        return true; // Consider as final on error
      }
    };

    // --- Logic for starting checks and polling ---
    // Make sure query parameters are available 
    if (!order_id || typeof order_id !== 'string') {
        setError('Order ID is missing or invalid.');
        setLoading(false);
        return;
    }

    // Якщо у нас вже є статус з URL (наприклад, 'succeeded'), можна враховувати це
    if (urlParams.status === 'succeeded') {
      console.log('Payment marked as succeeded in URL. Starting verification...');
    }

    setLoading(true);
    setError(null);
    console.log('Confirmation page loaded. Initial check...');

    checkOrderStatus().then(isFinal => {
      // Start polling only if status is not final yet
      if (!isFinal) {
        console.log(`Status is not final (${orderStatus}), starting polling...`);
        intervalRef.current = setInterval(async () => {
          console.log('Polling order status...');
          const final = await checkOrderStatus();
          if (final) {
            console.log('Polling stopped: final status received.');
            clearTimers();
          }
        }, POLLING_INTERVAL);

        // Set a timeout for polling
        timeoutRef.current = setTimeout(() => {
          console.warn('Polling timeout reached for order', orderId);
          clearTimers();
          // If status is still not final after timeout
          if (!['PAID', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(orderStatus ?? '')) {
            setError('Payment status verification timed out. Please check "My Orders" or contact support.');
          }
          setLoading(false); // Show current status or timeout error
        }, POLLING_TIMEOUT);
      } else {
        // If status is immediately final - polling is not needed
        console.log(`Polling not needed. Initial status: ${orderStatus}, Is final: ${isFinal}`);
        setLoading(false);
      }
    });

    // Clear timers when unmounting
    return () => {
      clearTimers();
    };
    // Restart effect when orderId changes or URL params are loaded
  }, [orderId, urlParams]);

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine which status icon to show
  const getStatusIcon = () => {
    switch (orderStatus) {
      case 'PAID':
        return <CheckCircle className="h-12 w-12 text-green-500"/>;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-12 w-12 text-red-500"/>;
      case 'PENDING':
        return <Clock className="h-12 w-12 text-amber-500"/>;
      case 'REFUNDED':
        return <RotateCcw className="h-12 w-12 text-blue-500"/>;
      default:
        return <AlertCircle className="h-12 w-12 text-gray-500"/>;
    }
  };

  // Determine status color
  const getStatusColor = () => {
    switch (orderStatus) {
      case 'PAID':
        return 'text-green-600';
      case 'FAILED':
      case 'CANCELLED':
        return 'text-red-600';
      case 'PENDING':
        return 'text-amber-600';
      case 'REFUNDED':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Determine status background
  const getStatusBg = () => {
    switch (orderStatus) {
      case 'PAID':
        return 'bg-green-100';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100';
      case 'PENDING':
        return 'bg-amber-100';
      case 'REFUNDED':
        return 'bg-black-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Get status heading text
  const getStatusHeading = () => {
    switch (orderStatus) {
      case 'PAID':
        return 'Payment Successful!';
      case 'FAILED':
        return 'Payment Failed';
      case 'CANCELLED':
        return 'Order Cancelled';
      case 'PENDING':
        return 'Payment Processing';
      case 'REFUNDED':
        return 'Payment Refunded';
      default:
        return 'Verifying Status';
    }
  };

  // Get status message text
  const getStatusMessage = () => {
    switch (orderStatus) {
      case 'PAID':
        return `Thank you! Your tickets for order #${orderId} are confirmed.`;
      case 'FAILED':
        return `Payment for order #${orderId} could not be processed. Your ticket reservation has been cancelled. Please try creating a new order.`;
      case 'CANCELLED':
        return `Order #${orderId} was cancelled.`;
      case 'PENDING':
        return `Your payment for order #${orderId} is still processing. This page will update automatically. If not, please check "My Orders" shortly.`;
      case 'REFUNDED':
        return `Your payment for order #${orderId} has been refunded.`;
      default:
        return `Checking the final status for order #${orderId}.`;
    }
  };

  return (
    <>
      <Head>
        <title>Order Confirmation | uevent</title>
        <meta name="description" content="Order confirmation details"/>
      </Head>

      <main className="min-h-screen dark:bg-gray-950 py-12">
        <div className="container mx-auto max-w-2xl px-4">
          {/* Navigation */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-8 flex items-center dark:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2"/>
            Return to Event
          </Button>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex justify-center items-center">
              Order Confirmation
              <CheckCircle className="h-12 w-12 px-2 bg-gray-200 rounded-full ml-2 mt-1"/>
            </h1>
            {orderId && (
              <p className="mt-2 text-[18px] text-gray-600 dark:text-gray-400">
                Order <span className="font-medium">#{orderId}</span>
              </p>
            )}
          </div>

          {/* Main Content */}
          {loading ? (
            <Card className="border-none shadow-lg bg-gray-100 dark:bg-gray-800">
              <CardContent className="pt-8 text-center">
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-12 w-12 animate-spin"/>
                </div>
                <p className="mt-3 text-gray-600 dark:text-gray-400">Verifying payment status...</p>
                {pollingAttemptsRef.current > 0 && (
                  <p className="mt-1 text-xs text-gray-400">Attempt {pollingAttemptsRef.current}/{MAX_POLLING_ATTEMPTS}</p>
                )}
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-none shadow-lg bg-gray-50 dark:bg-gray-800">
              <CardContent className="py-8 text-center">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-red-500"/>
                </div>
                <Alert
                  variant="destructive"
                  className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50"
                >
                  <AlertTitle className="text-lg font-semibold text-red-700 dark:text-red-300">
                    Verification Error
                  </AlertTitle>
                  <AlertDescription className="justify-center text-red-600 dark:text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
                <Button asChild className="mt-6">
                  <Link href="/profile">View My Orders</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-lg bg-gray-50 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  {getStatusIcon()}
                  <span className="ml-2">{getStatusHeading()}</span>
                </CardTitle>
                <CardDescription>{getStatusMessage()}</CardDescription>
              </CardHeader>
              <CardContent>
                {orderStatus === 'PAID' && orderDetails && (
                  <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-6">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Order Date: {formatDate(orderDetails.createdAt)}
                    </div>
                    {orderDetails.event && (
                      <div className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-1">
                        Event: {orderDetails.event.title}
                      </div>
                    )}
                    {orderDetails.totalAmount && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total: ${orderDetails.totalAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/profile" className="flex items-center">
                      <ShoppingBag className="h-4 w-4 mr-2"/>
                      View My Orders
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/">Browse Events</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default OrderConfirmationPage;
