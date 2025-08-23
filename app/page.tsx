import { HeroSection } from "../components/hero-section";
import { GiftSection } from "../components/gift-section";
import { PopularStores } from "../components/popular-stores";
import MainProductSection from "../components/MainProductSection";
import HomeCategories from "../components/HomeCategories";
import AdBanner from "../components/AdBanner";

export default function Home() {
  // Dummy data for demonstration; replace with real data fetching logic as needed
  interface Product {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    // Add other product fields as needed
  }

  const offers: Product[] = [];
  const bestSellers: Product[] = [];
  const selected: Product[] = [];


  return (
    <main className="flex flex-col gap-6 sm:p-2 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      {/* 2 Heroes */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><HeroSection /></div>
        <div className="hidden lg:block"><HeroSection /></div>
      </section>

      {/* Under Categories */}
      <HomeCategories />

      {/* Offer sections with a banner after every 3 sections */}
      <MainProductSection title="Todays Best Deals For You!" products={offers} linkToAll="/products?filter=offers" />
      <AdBanner imageSrc="/nte6_qz8v_230606.jpg" href="/products?filter=deals" title="Special Offers" subtitle="Up to 50% off" />
      <MainProductSection title="Top Deals In" products={bestSellers} linkToAll="/products?filter=best" />
      <AdBanner imageSrc="/4swapp-app.png" href="/products?filter=deals" title="Special Offers" subtitle="Up to 50% off" />
      <MainProductSection title="Best Sellers In Beauty & Health" products={selected} linkToAll="/products?filter=selected" />
      <AdBanner imageSrc="/nte6_qz8v_230606.jpg" href="/products?filter=deals" title="Special Offers" subtitle="Up to 50% off" />

      {/* Brands and gifts */}
      <PopularStores />
      <GiftSection />
    </main>
  );
}
