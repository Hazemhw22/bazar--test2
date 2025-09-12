"use client"

import Link from "next/link"
import { Home, Heart, ShoppingBag, ClipboardList, Menu } from "lucide-react"
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-gray-200/60 dark:border-border/60 shadow-lg flex justify-around items-center py-2 md:hidden z-50 rounded-t-2xl">
        <Link
          href="/"
          className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Home size={20} />
          {t("nav.home")}
        </Link>

        <Link
          href="/favourite"
          className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Heart size={20} />
          {t("nav.favorites")}
        </Link>

        <button
          onClick={onCartToggle}
          aria-label={t("nav.cart")}
          className="relative flex flex-col items-center text-xs text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <ShoppingBag size={24} />
          {t("nav.cart")}
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium shadow-md">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>

        <Link
          href="/orders"
          className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ClipboardList size={20} />
          {t("nav.orders")}
        </Link>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Menu size={20} />
          {t("nav.menu")}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowMenu(false)}>
          <div className="fixed bottom-16 left-4 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/categories"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <span className="text-2xl mb-2">📱</span>
                <span className="text-sm font-medium">{t("nav.categories")}</span>
              </Link>
              <Link
                href="/shops"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <span className="text-2xl mb-2">🏪</span>
                <span className="text-sm font-medium">{t("nav.shops")}</span>
              </Link>
              <Link
                href="/products"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <span className="text-2xl mb-2">🛍️</span>
                <span className="text-sm font-medium">{t("nav.products")}</span>
              </Link>
              <Link
                href="/contact"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <span className="text-2xl mb-2">📞</span>
                <span className="text-sm font-medium">{t("nav.contact")}</span>
              </Link>
              <Link
                href="/account"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors col-span-2"
                onClick={() => setShowMenu(false)}
              >
                <span className="text-2xl mb-2">👤</span>
                <span className="text-sm font-medium">{t("nav.account")}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
