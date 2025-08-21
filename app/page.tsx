import { HeroSection } from "../components/hero-section";
import BrandList from "../components/BrandList";
import { GiftSection } from "../components/gift-section";
import { PopularStores } from "../components/popular-stores";
import CategoryMenu from "../components/CategoryMenu";
import MainProductSection from "../components/MainProductSection";

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
    <main className="flex flex-col md:flex-row gap-4 sm:p-2 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      {/* القسم الرئيسي */}
      <section className="flex-1 flex flex-col gap-4">
        <HeroSection />
        {/* قائمة التصنيفات في الموبايل - تحت الهيرو */}
        <div className="block md:hidden mb-4">
          <BrandList />
        </div>
        <MainProductSection
          title="عروض اليوم"
          products={offers}
          linkToAll="/products?filter=offers"
        />
        <MainProductSection
          title="الأكثر مبيعًا"
          products={bestSellers}
          linkToAll="/products?filter=best"
        />
        <MainProductSection
          title="منتجات مختارة"
          products={selected}
          linkToAll="/products?filter=selected"
        />
        <PopularStores />
        <GiftSection />
      </section>
      
      {/* الشريط الجانبي في الديسكتوب */}
      <aside className="hidden md:flex flex-col gap-6 md:w-56 lg:w-64 shrink-0 md:mt-0 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
        <CategoryMenu />
        <BrandList />
      </aside>
    </main>
  );
}
