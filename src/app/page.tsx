"use client";
import EventsCardList from "@/components/event/events-card-list";
import EventsPopularCardCarousel from "@/components/event/events-popular-card-carousel";
import ProductFilters from "@/components/filter/product-filters";


import { useState, useEffect } from "react";


import { useSearchParams } from "next/navigation";
import AuthModal from "@/components/auth/auth-modal";
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
        <ProductFilters/>
        <EventsPopularCardCarousel />
        <EventsCardList />
      </main>
  );
}