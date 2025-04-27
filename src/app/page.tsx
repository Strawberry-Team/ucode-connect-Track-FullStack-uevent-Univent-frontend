"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AuthModal from "@/components/auth/auth-modal";
import MainPage from "@/components/main-page/main-page";
export default function Home() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        const resetToken = searchParams.get("reset_token");
        if (resetToken) {
            setIsAuthModalOpen(true);
        }
    }, [searchParams]);
  return (
      <main>
          <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
          />
          <MainPage />;
      </main>
  );
}
