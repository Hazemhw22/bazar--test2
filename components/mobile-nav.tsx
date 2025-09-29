"use client"

import Link from "next/link"
import { Home, User, ShoppingBag, ClipboardList, Menu, Heart, Store, Phone, Package, ShoppingCart } from "lucide-react"
import { useCart } from "./cart-provider"
import { useState } from "react"
import { useI18n } from "../lib/i18n"

interface MobileNavProps {
  onCartToggle: () => void
}

export function MobileNav({ onCartToggle }: MobileNavProps) {
  const { totalItems } = useCart()
  const [showMenu, setShowMenu] = useState(false)
  const { t } = useI18n()

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900 to-indigo-900 border-t border-purple-800/60 shadow-lg flex justify-around items-center py-3 md:hidden z-50 rounded-t-2xl">
        <Link
          href="/"
          className="flex flex-col items-center text-xs text-white hover:text-purple-300 transition-colors"
        >
          <Home size={20} className="mb-1" />
          <span>{t("nav.home")}</span>
        </Link>

        <button
          onClick={onCartToggle}
          className="flex flex-col items-center text-xs text-white hover:text-purple-300 transition-colors relative"
        >
          <ShoppingCart size={20} className="mb-1" />
          <span>{t("nav.cart")}</span>
          {totalItems > 0 && (
            <span className="absolute top-[-18px] right-[10px] flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] text-white font-medium shadow-md z-10">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>

        <Link
          href="/account"
          className="flex flex-col items-center text-xs text-white hover:text-purple-300 transition-colors"
        >
          <User size={20} className="mb-1" />
          <span>{t("nav.account")}</span>
        </Link>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex flex-col items-center text-xs text-white hover:text-purple-300 transition-colors"
        >
          <Menu size={20} className="mb-1" />
          <span>{t("nav.menu")}</span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowMenu(false)}>
          <div className="fixed bottom-16 left-4 right-4 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg shadow-xl p-4 border border-purple-800">
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/categories"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-purple-800/50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <span className="text-2xl mb-2">📱</span>
                <span className="text-sm font-medium text-white">{t("nav.categories")}</span>
              </Link>
              <Link
                href="/shops"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-purple-800/50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <span className="text-2xl mb-2">🏪</span>
                <span className="text-sm font-medium text-white">{t("nav.shops")}</span>
              </Link>
              <Link
                href="/products"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-purple-800/50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <span className="text-2xl mb-2">🛍️</span>
                <span className="text-sm font-medium text-white">{t("nav.sales")}</span>
              </Link>
              <Link
                href="/contact"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-purple-800/50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <span className="text-2xl mb-2">📞</span>
                <span className="text-sm font-medium text-white">{t("nav.contact")}</span>
              </Link>
              
              <Link
                href="/orders"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-purple-800/50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <span className="text-2xl mb-2">📦</span>
                <span className="text-sm font-medium text-white">{t("nav.orders")}</span>
              </Link>
              
              <Link
                href="/favourite"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-purple-800/50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <span className="text-2xl mb-2">❤️</span>
                <span className="text-sm font-medium text-white">{t("nav.wishlist")}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
