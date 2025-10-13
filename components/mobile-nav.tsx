"use client";

import Link from "next/link";
import { Home, ShoppingCart, ClipboardList, ShoppingBag, Store } from "lucide-react";
import RestaurantSvg from "@/components/icons/RestaurantSvg";
import { useCart } from "./cart-provider";
import { useI18n } from "../lib/i18n";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  onCartToggle: () => void;
}

export function MobileNav({ onCartToggle }: MobileNavProps) {
  const { totalItems } = useCart();
  const { t } = useI18n();
  const pathname = usePathname();

  const navItems = [
  { href: "/", label: t("nav.home"), icon: Home },
  { href: "/products", label: t("nav.sales"), icon: ShoppingBag },
  { href: "/restaurants", label: t("nav.restaurants") , icon: (props: any) => <RestaurantSvg size={22} {...props} /> },
    { href: "/shops", label: t("nav.shops"), icon: Store },
   { href: "/cart", label: t("nav.cart"), icon: ShoppingCart, isCart: true },
  ];

  return (
    <nav className="fixed bottom-1 left-1/2 -translate-x-1/2 w-[95%] max-w-md mx-auto bg-card/80 backdrop-blur-lg border border-white/10 shadow-2xl flex justify-around items-center py-2.5 md:hidden z-50 rounded-full">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <button
            key={item.href}
            onClick={item.isCart ? onCartToggle : undefined}
            className={`flex flex-col items-center text-xs transition-colors w-16 ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            {item.isCart ? (
              <div className="relative">
                <item.icon
                  size={22}
                  className={`mb-1 transition-all ${isActive ? "text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" : ""}`}
                />
                {totalItems > 0 && (
                  <span className="absolute top-[-5px] right-[-8px] flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-medium shadow-md">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>
            ) : (
              <Link href={item.href} className="flex flex-col items-center">
                <item.icon
                  size={22}
                  className={`mb-1 transition-all ${isActive ? "text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" : ""}`}
                />
              </Link>
            )}
            <span className="text-[11px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
