"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  Loader2,
  ShoppingBag,
  Undo2,
  Wallet,
  CircleX,
  CircleCheck,
  Clock2,
  Shield,
  CreditCard
} from 'lucide-react';
import {getOrderById} from '@/lib/orders';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '@/components/payment/payment-form';
import { format } from "date-fns";
import { Order } from '@/types/order';

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
const [orderData, setOrderData] = useState<Order | null>(null);
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
        
        // Встановити дані замовлення для відображення
        if (response.success && response.data) {
          setOrderData(response.data);
        }

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
          setError('Verification timeout. Please try again later.');
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
        return <CircleCheck className="h-5 w-5 text-black"/>;
      case 'FAILED':
      case 'CANCELLED':
        return <CircleX className="h-5 w-5 text-black"/>;
      case 'PENDING':
        return <Clock2 className="h-5 w-5 text-black"/>;
      case 'REFUNDED':
        return <RotateCcw className="h-5 w-5 text-black"/>;
      default:
        return <AlertCircle className="h-5 w-5 text-black"/>;
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
        return 'text-yellow-600';
      case 'REFUNDED':
        return 'text-blue-600';
      default:
        return 'text-black';
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
        return 'bg-yellow-100';
      case 'REFUNDED':
        return 'bg-black-100';
      default:
        return 'bg-black';
    }
  };

  // Get status heading text
  const getStatusHeading = () => {
    switch (orderStatus) {
      case 'PAID':
        return 'Success';
      case 'FAILED':
        return 'Failed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'PENDING':
        return 'Processing';
      case 'REFUNDED':
        return 'Refunded';
      default:
        return 'Verifying';
    }
  };

  // Get status message text
  const getStatusMessage = () => {
    switch (orderStatus) {
      case 'PAID':
        return `Your payment is confirmed. The tickets have been sent to your email. You can also view them in the order details in your profile.`;
      case 'FAILED':
        return `Your payment wasn't processed. Please try again.`;
      case 'CANCELLED':
        return `This order has been cancelled`;
      case 'PENDING':
        return `Your payment is still processing. This page will update automatically.`;
      case 'REFUNDED':
        return `Your payment has been refunded`;
      default:
        return `Checking payment status...`;
    }
  };

  return (
    <>
      <Head>
          <title className="text-black">
            <span className="text-black">order payment | </span>
            <span>{process.env.NEXT_PUBLIC_APP_NAME}</span>
          </title>
          <meta name="description" content={`Payment status for Order #${order_id}`} />
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
                <Undo2 strokeWidth={2.5} className="h-4 w-4 mr-2"/>
                Go back
              </Button>
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                onClick={() => router.push('/profile')}
                className="mb-8 flex items-center text-black hover:bg-black hover:text-white transition-colors duration-300"
              >
                <Wallet strokeWidth={2.5} className="h-4 w-4 mr-2"/>
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
                Payment status
              </p>
            </div>

          {/* Main Content */}
          {loading ? (
            <Card className="border-none shadow-xl rounded-xl bg-gray-50">
            <CardContent className="p-12 text-center flex flex-col items-center justify-center space-y-6">
              <div className="flex justify-center items-center">
                <Loader2 strokeWidth={2.5} className="h-5 w-5 text-black animate-spin" />
                <h3 className="ml-2 text-xl font-semibold">
                  Loading payment status...
                </h3>
              </div>
              {pollingAttemptsRef.current > 0 && (
                <p className="text-base">Attempt {pollingAttemptsRef.current}/{MAX_POLLING_ATTEMPTS}</p>
              )}
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="mt-4 flex items-center text-black hover:bg-black hover:text-white transition-colors duration-300"
              >
                <Wallet strokeWidth={2.5} className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-none shadow-xl rounded-xl bg-gray-50">
              <CardContent className="p-12 text-center flex flex-col items-center justify-center space-y-6">
                <div className="flex justify-center items-center">
                  <CircleX strokeWidth={2.5} className="h-5 w-5 text-black" />
                  <h3 className="ml-2 text-xl font-semibold">
                    Failed to verify payment status
                  </h3>
                </div>
                <p className="text-base">
                  {error}
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="mt-4 flex items-center text-black hover:bg-black hover:text-white transition-colors duration-300"
                >
                  <Wallet strokeWidth={2.5} className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-xl rounded-xl bg-gray-50">
              <CardContent className="p-12 text-center flex flex-col items-center justify-center space-y-6">
                <div className="flex justify-center items-center">
                  {getStatusIcon()}
                  <h3 className="ml-2 text-xl font-semibold">
                    {getStatusHeading()}
                  </h3>
                </div>
                <p className="text-base">
                  {getStatusMessage()}
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="mt-4 flex items-center text-black hover:bg-black hover:text-white transition-colors duration-300"
                >
                  <Wallet strokeWidth={2.5} className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default OrderConfirmationPage;
