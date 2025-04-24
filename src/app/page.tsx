"use client";
import ProductCardList from "@/components/card/product-card-list";
import PopularCardsCarousel from "@/components/card/popular-cards-carousel";
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
            setIsAuthModalOpen(true); // Открываем модалку, если есть reset_token
        }
    }, [searchParams]);
  return (
      <main>
          <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
          />
        <ProductFilters/>
        <PopularCardsCarousel />
        <ProductCardList />
      </main>
  );
}