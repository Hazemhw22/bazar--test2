// @ts-nocheck
// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { HeroSection } from "../components/hero-section";
import Link from "next/link";
import Image from "next/image";
import { GiftSection } from "../components/gift-section";
import { PopularStores } from "../components/popular-stores";
import MainProductSection from "../components/MainProductSection";
import { SpecialOffers } from "../components/special-offers";
import { NearToYou } from "../components/near-to-you";
import { LocationModal } from "../components/location-modal";
import { useLocation } from "../components/location-provider";
import { HomeCategories } from "../components/home-categories";
import type { Product, CategoryShop } from "@/lib/type";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "../components/ProductCard";
import AdBanner from "../components/AdBanner";
import CategoriesWithProducts from "../components/CategoriesWithProducts";

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
      <main className="flex flex-col gap-4 sm:p-2 min-h-screen transition-colors duration-300 mobile:max-w-[480px] mobile:mx-auto mobile:px-2 mobile:gap-3">
        
         {/* Hero Section */}
        <section className="mobile:mt-2">
          <HeroSection />
        </section>

        {/* Home Categories Section */}
        <div className="px-1">
          <HomeCategories />
        </div>

        {/* Special Offers Section */}
        <div className="px-1">
          <SpecialOffers />
        </div>

        {/* Near To You Section (carousel like Special Offers) */}
        <div className="px-1">
          <NearToYou />
        </div>

          {/* Stores and Gift Section */}
        <div className="px-1">
          <PopularStores />
        </div>

        {/* Product Sections with Banners */}
        <div className="px-1">
          <MainProductSection title="Todays Best Deals For You!" products={offers} linkToAll="/products?filter=offers" />
        </div>
        <AdBanner
          imageSrc="/shopping-concept-close-up-portrait-young-beautiful-attractive-redhair-girl-smiling-looking-camera.jpg"
          href="/products?filter=deals"
          title="Special Offers"
          subtitle="Up to 50% off"
          className="bg-gradient-to-r from-pazar-primary/10 to-pazar-secondary/10"
        />

        <div className="px-1">
          <MainProductSection title="Top Deals In" products={bestSellers} linkToAll="/products?filter=best" />
        </div>
        <AdBanner
          imageSrc="/shopping-concept-close-up-portrait-young-beautiful-attractive-redhair-girl-smiling-looking-camera.jpg"
          href="/products?filter=deals"
          title="Special Offers"
          subtitle="Up to 50% off"
          className="bg-gradient-to-r from-pazar-primary/10 to-pazar-secondary/10"
        />

        <div className="px-1">
          <MainProductSection title="Best Sellers In Beauty & Health" products={selected} linkToAll="/products?filter=selected" />
        </div>
   
      
        <div className="px-1 pb-24">
          <CategoriesWithProducts />
          <GiftSection />
        </div>
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

// moved to components/CategoriesWithProducts.tsx
