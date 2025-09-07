"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Search,
  User,
  Bell,
  ShoppingCart,
  Home,
  List,
  Heart,
  Store,
  Phone,
  MapPin,
  Package,
  Download,
  ShoppingBag
} from "lucide-react";
import { useCart } from "./cart-provider";
import { useLocation } from "./location-provider";
import { MobileNav } from "./mobile-nav";
import { VristoLogo } from "./vristo-logo";
import { LanguageSelector } from "./language-select";
import { useI18n } from "../lib/i18n";
import ThemeToggle from "./theme-toggle";
import { CartSidebar } from "./cart-sidebar";
import CategoryMenu from "./CategoryMenu";

export function SiteHeader() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { selectedCity, setShowLocationModal } = useLocation();

  useEffect(() => setMounted(true), []);

  const handleCartToggle = () => setCartOpen(true);
  const handleLocationChange = () => setShowLocationModal(true);

  const getCityDisplayName = (city: any) => {
    // Get the current language from localStorage or default to English
    const currentLang = localStorage.getItem("language") || "en";
    switch (currentLang) {
      case "ar": return city.nameAr;
      case "he": return city.nameHe;
      default: return city.name;
    }
  };

  return (
    <>
      <header className="w-full border-b bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40">

        {/* Upper header - Desktop & Medium screens */}
        <div className="bg-gray-50 dark:bg-gray-800 text-[12px] py-2 border-b border-gray-200 dark:border-gray-700 hidden md:flex items-center px-3 lg:px-4">
          <div className="max-w-[1600px] mx-auto w-full flex items-center justify-center gap-3">

            {/* الموقع */}
            <button
              onClick={handleLocationChange}
              className="flex items-center gap-1 text-[18px] text-gray-600 dark:text-gray-400 whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group"
            >
              <MapPin className="w-6 h-6 text-black dark:text-white group-hover:text-blue-600 transition-colors" />
              {selectedCity ? getCityDisplayName(selectedCity) : "Select Location"}
            </button>
            {/* Search */}
            <div className="flex-1 max-w-[760px]">
              <div className="relative flex items-center rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                <span className="pl-2 text-purple-500">✨</span>
                <input
                  type="text"
                  placeholder="Search for brands or products"
                  className="flex-1 bg-transparent py-1 px-2 text-[18px] focus:outline-none dark:text-white"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-full m-1 transition-colors">
                  <Search size={18}  />
                </button>
              </div>
            </div>

            {/* أيقونات الحساب والسلة */}
            <div className="flex items-center gap-1.5">
              <Link href="/account" className="p-1.5 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-700 transition-colors">
                <User size={18} className="w-6 h-6 text-black dark:text-white group-hover:text-blue-600 transition-colors" />
              </Link>
              <button
                className="p-1.5 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-700 transition-colors relative"
                onClick={handleCartToggle}
              >
                <ShoppingCart size={18} className="w-6 h-6 text-black dark:text-white group-hover:text-blue-600 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex w-6 h-6 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-medium">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="mx-auto px-3 sm:px-4 py-1 md:py-1 flex justify-between items-center max-w-[1600px]">

          {/* Mobile Header */}
          <div className="w-full flex md:hidden flex-col gap-2">

            {/* اللوجو والموقع */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleLocationChange}
                className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group"
              >
                <MapPin className="w-4 h-4 text-black dark:text-white group-hover:text-blue-600 transition-colors" />
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors">
                  {selectedCity ? getCityDisplayName(selectedCity) : "Select Location"}
                </span>
              </button>
               <div><VristoLogo size={56} /></div>
              <div className="flex items-center gap-2">
                {mounted && <ThemeToggle />}
                {mounted && <LanguageSelector />}
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center px-2">
              <div className="relative flex items-center flex-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                <span className="pl-2 text-purple-500">✨</span>
                <input
                  type="text"
                  placeholder="Search for brands or products"
                  className="flex-1 bg-transparent py-1.5 px-2 text-sm focus:outline-none dark:text-white"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-full m-1 transition-colors">
                  <Search size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center gap-4 lg:gap-5 w-full">

            {/* اللوجو والعناوين */}
            <div className="flex items-center gap-3 lg:gap-4 text-[15px] lg:text-[16px]">
              <VristoLogo size={60} />

              <nav className="flex gap-4 lg:gap-6 font-medium font-sans">
                <Link
                  href="/"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 relative group"
                >
                  <Home size={14} className="lg:w-4 lg:h-4" /> {t("nav.home")}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all group-hover:w-full"></span>
                </Link>
                <Link
                  href="/categories"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 relative group"
                >
                  <List size={14} className="lg:w-4 lg:h-4" /> {t("nav.categories")}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all group-hover:w-full"></span>
                </Link>
                <Link
                  href="/favourite"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 relative group"
                >
                  <Heart size={14} className="lg:w-4 lg:h-4" /> {t("nav.favorites")}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all group-hover:w-full"></span>
                </Link>
                <Link
                  href="/shops"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 relative group"
                >
                  <Store size={14} className="lg:w-4 lg:h-4" /> {t("nav.shops")}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all group-hover:w-full"></span>
                </Link>
                <Link
                  href="/products"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 relative group"
                >
                  <ShoppingBag size={14} className="lg:w-4 lg:h-4" /> {t("nav.products")}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all group-hover:w-full"></span>
                </Link>
                <Link
                  href="/contact"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 relative group"
                >
                  <Phone size={14} className="lg:w-4 lg:h-4" /> {t("nav.contact")}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all group-hover:w-full"></span>
                </Link>
              </nav>
            </div>

            {/* أيقونات اليمين للـ Desktop - جميع الأيقونات في اليمين */}
            <div className="flex items-center gap-1.5 lg:gap-2 ml-auto">
              {mounted && <ThemeToggle />}
              <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Install App">
                <Download size={16} />
              </button>
              <Link href="/orders" className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Package size={16} />
              </Link>
              {mounted && <LanguageSelector />}
              <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative" aria-label="الإشعارات">
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-red-500"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation menu */}
      <div className="md:hidden">
        <MobileNav onCartToggle={handleCartToggle} />
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Mobile Categories Bar */}
      <div className="w-full md:hidden">
        <CategoryMenu />
      </div>
    </>
  );
}