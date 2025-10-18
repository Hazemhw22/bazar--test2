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
  ShoppingBag,
  Menu
} from "lucide-react";
import { useCart } from "./cart-provider";
import { useLocation } from "./location-provider";
import { MobileNav } from "./mobile-nav";
import Image from "next/image";
import { LanguageSelector } from "./language-select";
import { useI18n } from "../lib/i18n";
import ThemeToggle from "./theme-toggle";
import { CartSidebar } from "./cart-sidebar";
import CategoryMenu from "./CategoryMenu";
import { supabase } from "@/lib/supabase";
import MobileSidebar from "./mobile-sidebar";

export function SiteHeader() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      <header className="w-full border-b sticky top-0 z-40 bg-card">

        {/* Upper header - Desktop & Medium screens */}
        <div className="bg-pazar-primary text-white py-2 border-b border-opacity-20 dark:bg-pazar-dark-bg hidden md:block">
          <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <button
                  onClick={handleLocationChange}
                  className="text-sm hover:underline cursor-pointer flex items-center"
                >
                  <span>{t("header.yourLocation")}</span>
                  <span className="font-medium ml-1">{selectedCity ? getCityDisplayName(selectedCity) : t("header.selectLocation")}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <Link href="/orders" className="rounded-full hover:bg-pazar-primary-light hover:bg-opacity-20 p-1 transition-colors">
                <Package size={20} />
              </Link>
                {mounted && <ThemeToggle />}
              {mounted && <LanguageSelector />}
              </div>
              <div className="flex items-center gap-1">
                <UserIcon className="w-5 h-5" />
                <Link href="/auth" className="text-sm hover:underline">{t("header.joinUs")}</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main header - Desktop */}
        <div className="hidden md:block py-3">
          <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between px-4">
            <div className="flex items-center gap-8">
              <Link href="/">
                <div className="flex items-center">
                  <div className="rounded-md">
                      <Image src="/pazar.png" alt="Pazar Logo" width={60} height={60} />
                  </div>
                  <span className="text-xl font-bold text-pazar-primary dark:text-white">PAZAR</span>
                </div>
              </Link>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-[600px] mx-8">
              <div className="relative flex items-center rounded-lg border-2 bg-card overflow-hidden">
                <span className="pl-2 text-secondary">✨</span>
                <input
                  type="text"
                  placeholder={t("nav.searchPlaceholder")}
                  className="flex-1 bg-transparent py-1 px-2 text-[18px] focus:outline-none"
                />
                <button className="bg-primary hover:bg-opacity-90 text-primary-foreground px-5 py-2 transition-colors">
                  <Search size={20} />
                </button>
              </div>
            </div>

            {/* Icons menu */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex flex-col items-center gap-1 group">
                <Home className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  {t("nav.home")}
                </span>
              </Link>
              
              <Link href="/categories" className="flex flex-col items-center gap-1 group">
                <List className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  {t("nav.categories")}
                </span>
              </Link>
              
              <Link href="/shops" className="flex flex-col items-center gap-1 group">
                <Store className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  {t("nav.shops")}
                </span>
              </Link>

              <Link href="/products" className="flex flex-col items-center gap-1 group">
                <ShoppingBag className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  {t("nav.sales")}
                </span>
              </Link>

              <Link href="/favourite" className="flex flex-col items-center gap-1 group">
                <Heart className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  {t("nav.wishlist")}
                </span>
              </Link>
              
              <Link href="/account" className="flex flex-col items-center gap-1 group">
                <UserIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  {t("nav.account") || "Account"}
                </span>
              </Link>

              <button
                className="flex flex-col items-center gap-1 group relative"
                onClick={handleCartToggle}
              >
                <ShoppingCart className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 flex w-5 h-5 items-center justify-center rounded-full bg-secondary text-[10px] text-secondary-foreground font-medium">
                    {totalItems}
                  </span>
                )}
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
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

            <div className="w-full flex md:hidden items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Pazar Logo" width={28} height={28} />
                <span className="font-bold text-lg">{t("app.title")}</span>
              </Link>

              <div className="flex-1 flex justify-center">
                <button
                  onClick={handleLocationChange}
                  className="text-xs hover:underline cursor-pointer flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span className="font-medium truncate max-w-[120px]">{selectedCity ? getCityDisplayName(selectedCity) : t("header.selectLocation")}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>

              <div className="flex items-center gap-1">
                {mounted && <ThemeToggle />}
                {mounted && <LanguageSelector />}
                <button className="p-2" onClick={() => setSidebarOpen(true)}>
                  <Menu />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-1 w-full md:hidden">
              <div className="relative flex items-center flex-1 rounded-full bg-card border border-border overflow-hidden">
                <Search size={16} className="mx-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("search.mobilePlaceholder")}
                  className="flex-1 bg-transparent py-2 pr-3 text-sm focus:outline-none"
                />
                <button className="p-2 bg-transparent">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M6 12H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M10 17H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

      {/* Mobile Sidebar */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

      {/* Mobile Categories Bar
      <div className="w-full md:hidden">
        <CategoryMenu />
      </div> */}
    </>
  );
}