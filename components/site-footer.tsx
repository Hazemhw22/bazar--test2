"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone, ArrowUp } from "lucide-react"
import { VristoLogo } from "./vristo-logo"

const SiteFooter: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <footer className="relative bg-blue-50 dark:bg-gray-900 pt-10 text-gray-700 dark:text-gray-300">
      <div className="container mx-auto px-4 max-w-[1280px]">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-20">
          {/* First column: Logo and newsletter */}
          <div className="flex flex-col space-y-4 items-center sm:items-start text-center sm:text-left">
            <div className="w-full flex justify-center sm:justify-start">
              <VristoLogo size={110} className="mx-auto sm:mx-0" />
            </div>
            <p className="text-sm w-full text-center sm:text-left">
              Subscribe to our newsletter to get latest updates
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 w-full justify-center sm:justify-start">
              <input
                type="email"
                placeholder="Your Email Address"
                className="bg-white dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-l-md px-3 py-2 flex-grow text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-md px-4 py-2 text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <div className="flex space-x-3 mt-6 justify-center w-full">
              <a
                href="#"
                className="bg-blue-500 p-2 rounded-full text-white hover:bg-blue-600"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-blue-500 p-2 rounded-full text-white hover:bg-blue-600"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-blue-500 p-2 rounded-full text-white hover:bg-blue-600"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Second column: Quick links */}
          <div className="flex flex-col space-y-4 items-center sm:items-start text-center sm:text-left">
            <h3 className="font-semibold text-base">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/stores/become-owner"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Become a Store Owner
                </Link>
              </li>
              <li>
                <Link
                  href="/delivery/become-driver"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Become a Delivery Man
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Help & Support
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Third column: Contact info */}
          <div className="flex flex-col space-y-4 items-center sm:items-start text-center sm:text-left">
            <h3 className="font-medium mb-4">Contact Us</h3>
            <div className="flex flex-col space-y-4">
              <div>
                <div className="flex items-center justify-center sm:justify-start mb-2">
                  <Mail className="h-5 w-5 mr-2" />
                  <h4 className="font-medium">Send us Mail</h4>
                </div>
                <a
                  href="mailto:support@vristo.com"
                  className="text-sm hover:underline"
                >
                  support@vristo.com
                </a>
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start mb-2">
                  <Phone className="h-5 w-5 mr-2" />
                  <h4 className="font-medium">Contact Us</h4>
                </div>
                <a href="tel:0506667277" className="text-sm hover:underline">
                  0506667277
                </a>
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <h4 className="font-medium">Find us Here</h4>
                </div>
                <p className="text-sm">Arad, Israel</p>
              </div>
            </div>
          </div>

          {/* Fourth column: Additional info */}
          <div className="flex flex-col space-y-4 items-center sm:items-start text-center sm:text-left">
            <h3 className="font-semibold text-base">More Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/faq"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Return & Exchange
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-800 dark:bg-gray-900 py-4 mt-10 text-center text-sm text-white">
        © 2025 Vristo. All rights reserved.
      </div>

      {/* Back to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-16 right-6 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform animate-bounce"
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </footer>
  );
}

export default SiteFooter
