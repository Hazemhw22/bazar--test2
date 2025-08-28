"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Search,
  User,
  Bell,
  ShoppingBag as BagIcon,
  ShoppingCart,
  Home,
  List,
  Heart,
  Store,
  Phone,
  MapPin,
  Package,
  Download 
} from "lucide-react";
import { useCart } from "./cart-provider";
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

  useEffect(() => setMounted(true), []);

  const handleCartToggle = () => setCartOpen(true);

  return (
    <>
      <header className="w-full border-b bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40">

       {/* Upper header - Desktop only */}
<div className="bg-gray-50 dark:bg-gray-800 text-sm py-3 border-b border-gray-200 dark:border-gray-700 hidden md:flex items-center px-8 max-w-full">
  <div className="flex items-center w-full max-w-[1600px] mx-auto justify-between gap-6">

    {/* الموقع */}
    <span className="flex items-center gap-1 text-lg text-gray-600 dark:text-gray-400 whitespace-nowrap">
      <MapPin className="w-5 h-5 text-black dark:text-white" />
      Arad, Israel
    </span>

    {/* Search */}
    <div className="flex-1 mx-6">
      <div className="relative flex items-center rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-md overflow-hidden">
        <span className="pl-3 text-purple-500">✨</span>
        <input
          type="text"
          placeholder="Search for brands or products"
          className="flex-1 bg-transparent py-2.5 px-3 text-sm focus:outline-none dark:text-white"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full m-1 transition-colors">
          <Search size={18} />
        </button>
      </div>
    </div>

    {/* أيقونات الحساب والسلة */}
    <div className="flex items-center gap-3">
      <Link
        href="/account"
        className="p-3 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-700 transition-colors"
        aria-label="الحساب"
      >
        <User size={20} />
      </Link>
      <button
        className="p-3 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-700 transition-colors relative"
        onClick={handleCartToggle}
        aria-label="السلة"
      >
        <ShoppingCart size={20} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium">
            {totalItems}
          </span>
        )}
      </button>
    </div>

  </div>
</div>


        {/* Main header */}
        <div className="mx-auto px-4 py-2 md:py-1 flex justify-between items-center max-w-[1600px]">

         {/* Mobile Header */}
<div className="w-full flex md:hidden flex-col gap-1.5">

  {/* اللوجو والموقع */}
  <div className="flex justify-between items-center ">
    <div className="flex items-center gap-1.5">
      <MapPin className="w-5 h-5 text-black dark:text-white" />
      <span className="text-sm text-gray-600 dark:text-gray-400">Arad, Israel</span>
    </div>

    <VristoLogo size={70} />

    <div className="flex items-center gap-1.5">
      {mounted && <ThemeToggle />}
      {mounted && <LanguageSelector />}
      <button
        onClick={handleCartToggle}
        className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
      >
       
      </button>
    </div>
  </div>

  {/* Search */}
  <div className="flex items-center px-2">
    <div className="relative flex items-center flex-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <span className="pl-3 text-purple-500">✨</span>
      <input
        type="text"
        placeholder="Search for brands or products"
        className="flex-1 bg-transparent py-2 px-2 text-sm focus:outline-none dark:text-white"
      />
      <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full m-1 transition-colors">
        <Search size={18} />
      </button>
    </div>
  </div>
</div>


        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between w-full max-w-[1600px] mx-auto px-6">
          
          {/* اللوجو والعناوين */}
          <div className="flex items-center gap-6">
            <VristoLogo size={90} />

            <nav className="flex gap-8 text-sm font-medium font-sans">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 relative group">
                <Home size={16} /> {t("nav.home")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/categories" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 relative group">
                <List size={16} /> {t("nav.categories")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/favourite" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 relative group">
                <Heart size={16} /> {t("nav.favorites")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/shops" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 relative group">
                <Store size={16} /> {t("nav.shops")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/products" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 relative group">
                <BagIcon size={16} /> {t("nav.products")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 relative group">
                <Phone size={16} /> {t("nav.contact")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all group-hover:w-full"></span>
              </Link>
            </nav>
          </div>

          {/* الأيقونات على اليمين */}
          <div className="flex items-center gap-3">
            {mounted && <ThemeToggle />}
            <button className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Install App">
              <Download size={25} />
            </button>
            <Link href="/orders" className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Package size={25} />
            </Link>
            {mounted && <LanguageSelector />}
            <button className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative" aria-label="الإشعارات">
              <Bell size={25} />
              <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <button
              className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              onClick={handleCartToggle}
              aria-label="السلة"
            >
           
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
