// @ts-nocheck
// app/page.tsx
"use client";

import { HeroSection } from "../components/hero-section";
import { GiftSection } from "../components/gift-section";
import { PopularStores } from "../components/popular-stores";
import MainProductSection from "../components/MainProductSection";
import { SpecialOffers } from "../components/special-offers";
import { LocationModal } from "../components/location-modal";
import { useLocation } from "../components/location-provider";
import { HomeCategories } from "../components/home-categories";
import type { Product } from "@/lib/type";
import AdBanner from "../components/AdBanner";

export default function Home() {
  const { showLocationModal, setShowLocationModal, selectedCity, setSelectedCity } = useLocation();
  
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

  const handleLocationSelect = (city: any) => {
    setSelectedCity(city);
    setShowLocationModal(false);
  };

  return (
    <>
      <main className="flex flex-col gap-6 sm:p-2 bg-background min-h-screen transition-colors duration-300 mobile:max-w-[480px] mobile:mx-auto mobile:px-4">
        
         {/* الهيرو الكبير والهيرو الصغير */}
        <section className="mobile:mt-2">
          <HeroSection />
        </section>

        {/* Home Categories Section */}
        <HomeCategories />

        {/* Special Offers Section */}
        <SpecialOffers />

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

      {/* Location Selection Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelect={handleLocationSelect}
      />
    </>
  );
}
