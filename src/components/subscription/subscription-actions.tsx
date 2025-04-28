"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createSubscription, deleteSubscription } from "@/lib/subscriptions";
import { getUserEventSubscriptions, getUserCompanySubscriptions } from "@/lib/users";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";
import { CompanySubscription } from "@/types/company";
import { EventSubscription } from "@/types/event";
import { SubscriptionActionsProps } from "@/types/subscription";
import { Bell } from "lucide-react";

export default function SubscriptionActions({
    title,
    entityId,
    userId,
    isCompanyPage = false,
}: SubscriptionActionsProps) {
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [actionLoading, setActionLoading] = useState<boolean>(false);

    useEffect(() => {
        const checkSubscription = async () => {
            if (!userId) {
                setIsSubscribed(false);
                setSubscriptionId(null);
                setInitialLoading(false);
                return;
            }

            setInitialLoading(true);
            let subscription: EventSubscription | CompanySubscription | undefined;

            if (isCompanyPage) {
                const response = await getUserCompanySubscriptions(userId);
                if (response.success && response.data) {
                    subscription = response.data.find((sub) => sub.companyId === entityId);
                }
            } else {
                const response = await getUserEventSubscriptions(userId);
                if (response.success && response.data) {
                    subscription = response.data.find((sub) => sub.eventId === entityId);
                }
            }

            setInitialLoading(false);

            if (subscription) {
                setIsSubscribed(true);
                setSubscriptionId(subscription.id);
            } else {
                setIsSubscribed(false);
                setSubscriptionId(null);
            }
        };

        checkSubscription();
    }, [entityId, userId, isCompanyPage]);

    const handleSubscribe = async () => {
        setActionLoading(true);
        const response = await createSubscription({
            entityId,
            entityType: isCompanyPage ? "company" : "event",
        });
        setActionLoading(false);

        if (response.success && response.data) {
            setIsSubscribed(true);
            setSubscriptionId(response.data.id);
            showSuccessToast(
                `You have successfully subscribed to ${isCompanyPage ? "company" : "event"} notifications for ${title}`
            );
        } else {
            showErrorToasts("Failed to subscribe to notifications");
        }
    };

    const handleUnsubscribe = async () => {
        if (!subscriptionId) return;

        setActionLoading(true);
        const response = await deleteSubscription(subscriptionId);
        setActionLoading(false);

        if (response.success) {
            setIsSubscribed(false);
            setSubscriptionId(null);
            showSuccessToast(
                `You have unsubscribed from ${isCompanyPage ? "company" : "event"} notifications for ${title}`
            );
        } else {
            showErrorToasts("Failed to unsubscribe from notifications");
        }
    };

    return (
        <div className="flex gap-2">
            {initialLoading ? (
                <Skeleton className="mt-1 h-11 w-[300px] rounded-full" />
            ) : (
                <Button
                    variant="outline"
                    className="text-[16px] py-5 px-7 rounded-full font-medium mt-1 w-[300px]"
                    onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                    disabled={actionLoading}
                >
                    <Bell strokeWidth={2.5} className="w-7 h-7" />
                    {isSubscribed
                        ? "Unsubscribe from notifications"
                        : "Subscribe to notifications"}
                </Button>
            )}
        </div>
    );
}