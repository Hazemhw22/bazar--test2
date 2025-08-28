// app/page.tsx
import { HeroSection } from "../components/hero-section";
import { GiftSection } from "../components/gift-section";
import { PopularStores } from "../components/popular-stores";
import MainProductSection from "../components/MainProductSection";
import AdBanner from "../components/AdBanner";
import AutoCarousel from "../components/AutoCarousel"; // الهيرو الصغير الجديد
import type { Product } from "@/lib/type";

export default function Home() {
  // بيانات وهمية للمنتجات، استبدلها بالبيانات الحقيقية عند الفيتش من Supabase
  const offers: Product[] = [];
  const bestSellers: Product[] = [];
  const selected: Product[] = [];

  // مصفوفة صور للكاروسيل
  const carouselImages = [
    "/13208.jpg",
    "/top-view-young-woman-standing-ironing-board-showing-sale-icon-making-eyeglasses-gesture-blue-background.jpg",
    "/Woman getting virtual gift.jpg",
  ];

  return (
    <main className="flex flex-col gap-6 sm:p-2 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      
       {/* الهيرو الكبير والهيرو الصغير */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <HeroSection />
        </div>

        <div className="lg:col-span-1">
          <AutoCarousel images={carouselImages} />
        </div>
      </section>


      {/* عروض المنتجات مع بانر بعد كل قسم */}
      <MainProductSection title="Todays Best Deals For You!" products={offers} linkToAll="/products?filter=offers" />
      <AdBanner
        imageSrc="/shopping-concept-close-up-portrait-young-beautiful-attractive-redhair-girl-smiling-looking-camera.jpg"
        href="/products?filter=deals"
        title="Special Offers"
        subtitle="Up to 50% off"
      />

      <MainProductSection title="Top Deals In" products={bestSellers} linkToAll="/products?filter=best" />
      <AdBanner
        imageSrc="/shopping-concept-close-up-portrait-young-beautiful-attractive-redhair-girl-smiling-looking-camera.jpg"
        href="/products?filter=deals"
        title="Special Offers"
        subtitle="Up to 50% off"
      />

      <MainProductSection title="Best Sellers In Beauty & Health" products={selected} linkToAll="/products?filter=selected" />
      <AdBanner
        imageSrc="/shopping-concept-close-up-portrait-young-beautiful-attractive-redhair-girl-smiling-looking-camera.jpg"
        href="/products?filter=deals"
        title="Special Offers"
        subtitle="Up to 50% off"
      />

      {/* متاجر وعروض الهدايا */}
      <PopularStores />
      <GiftSection />
    </main>
  );
}
