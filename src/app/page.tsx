import ProductCardList from "@/components/card/ProductCardList";
import PopularCardsCarousel from "@/components/card/PopularCardsCarousel";

export default function Home() {
  return (
      <main>
        <PopularCardsCarousel />
        <ProductCardList />
      </main>
  );
}