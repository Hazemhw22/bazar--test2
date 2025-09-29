"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Profile } from "@/lib/type";
import {
  Search,
  User as UserIcon,
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
import { supabase } from "@/lib/supabase";

export function SiteHeader() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const { totalItems } = useCart();
  const { selectedCity, setShowLocationModal } = useLocation();

  useEffect(() => {
    setMounted(true);
    
    // Fetch user profile data
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) {
          setUser(profileData);
        }
      }
    };
    
    fetchUserProfile();
  }, []);

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
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-2 border-b border-purple-800 dark:border-purple-900 hidden md:block">
          <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <button
                  onClick={handleLocationChange}
                  className="text-sm hover:underline cursor-pointer flex items-center"
                >
                  <span>Your Location:</span>
                  <span className="font-medium ml-1">{selectedCity ? getCityDisplayName(selectedCity) : "Select Location"}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Link href="/orders" className="rounded-full hover:bg-purple-800 p-1 transition-colors">
                  <Package size={18} />
                </Link>
                {mounted && <ThemeToggle />}
                {mounted && <LanguageSelector />}
                <Link href="/favourite" className="rounded-full hover:bg-purple-800 p-1 transition-colors">
                  <Heart size={18} />
                </Link>
              </div>
              <div className="flex items-center gap-1">
                <UserIcon className="w-5 h-5" />
                <Link href="/auth" className="text-sm hover:underline">Join Us</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main header - Desktop */}
        <div className="hidden md:block bg-white dark:bg-gray-900 py-3">
          <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between px-4">
            <div className="flex items-center gap-8">
              <Link href="/">
                <div className="flex items-center">
                  <div className="rounded-md ">
                      <VristoLogo size={60} />
                  </div>
                  <span className="text-xl font-bold text-gray-800 dark:text-white">PAZAR</span>
                </div>
              </Link>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-[600px] mx-8">
              <div className="relative flex items-center rounded-lg border-2 border-purple-600 bg-white dark:bg-gray-800 overflow-hidden">
                <span className="pl-2 text-purple-500">✨</span>
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="flex-1 bg-transparent py-1 px-2 text-[18px] focus:outline-none dark:text-white"
                />
                <button className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white px-5 py-2 transition-colors">
                  <Search size={20} />
                </button>
              </div>
            </div>

            {/* Icons menu */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex flex-col items-center gap-1 group">
                <Home className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors">
                  {t("nav.home")}
                </span>
              </Link>
              
              <Link href="/categories" className="flex flex-col items-center gap-1 group">
                <List className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors">
                  {t("nav.categories")}
                </span>
              </Link>
              
              <Link href="/shops" className="flex flex-col items-center gap-1 group">
                <Store className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors">
                  {t("nav.shops")}
                </span>
              </Link>

              <Link href="/products" className="flex flex-col items-center gap-1 group">
                <ShoppingBag className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors">
                  {t("nav.sales")}
                </span>
              </Link>

              <Link href="/favourite" className="flex flex-col items-center gap-1 group">
                <Heart className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors">
                  {t("nav.wishlist")}
                </span>
              </Link>
              
              <Link href="/account" className="flex flex-col items-center gap-1 group">
                <UserIcon className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors">
                  {t("nav.account") || "Account"}
                </span>
              </Link>

              <button
                className="flex flex-col items-center gap-1 group relative"
                onClick={handleCartToggle}
              >
                <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 flex w-5 h-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-medium">
                    {totalItems}
                  </span>
                )}
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors">
                  {t("nav.cart") || "Cart"}
                </span>
              </button>
            </div>
          </div>
        </div>

      

        {/* Main header - Mobile */}
        <div className="mx-auto px-3 sm:px-4 py-1 md:py-1 flex justify-between items-center max-w-[1600px]">

          {/* Mobile Header */}
          <div className="w-full flex md:hidden flex-col gap-2">

            {/* Header Top Row */}
            <div className="flex justify-between items-center">
              {/* User greeting and profile */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src="/AVATAR1.png" alt="User" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Good Morning 👋</div>
                  <h3 className="text-sm font-semibold">{user?.full_name || "Guest"}</h3>
                </div>
              </div>
                {/* Location Button (Mobile) */}
            <div className="flex flex-col items-center gap-1 group">
              <button
                onClick={handleLocationChange}
                className="flex flex-col items-center justify-center"
              >
                <MapPin className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors" />
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium mt-1">
      {selectedCity ? getCityDisplayName(selectedCity) : "Location"}
    </span>
              </button>
            </div>

              {/* Theme toggle, language selector and favorites */}
              <div className="flex items-center gap-3">
                {mounted && <ThemeToggle />}
                {mounted && <LanguageSelector />}
                <Link href="/favourite" className="relative">
                  <Heart className="w-5 h-5" />
                </Link>
              </div>
            </div>

          
            {/* Search */}
            <div className="px-1">
              <div className="relative flex items-center flex-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Search size={16} className="mx-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="flex-1 bg-transparent py-2 pr-3 text-sm focus:outline-none"
                />
                <button className="p-2 bg-transparent">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7H21" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M6 12H18" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M10 17H14" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
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