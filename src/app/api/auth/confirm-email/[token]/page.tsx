"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { confirmEmail } from "@/lib/auth";
import { showErrorToasts, showSuccessToast } from "@/lib/toast";

export default function ConfirmEmailPage() {
    const router = useRouter();
    const { token } = useParams();

    useEffect(() => {
        const confirm = async () => {
            if (typeof token === "string") {
                const result = await confirmEmail(token);
                router.push("/");
                if (result.success) {
                    showSuccessToast("Email confirmed successfully");
                } else {
                    showErrorToasts(result.errors);
                }
            }
        };

        if (token) {
            confirm();
        }
    }, [token, router]);

    return (
        <div></div>
    );
}