import ProductCardList from "@/components/card/ProductCardList";
import PopularCardsCarousel from "@/components/card/PopularCardsCarousel";
import ProductFilters from "@/components/filter/ProductFilters";

export default function Home() {
  return (
      <main>
        <ProductFilters/>
        <PopularCardsCarousel />
        <ProductCardList />
      </main>
  );
}