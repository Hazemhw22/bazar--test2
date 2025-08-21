// app/app-providers.tsx أو wherever your AppProviders is located
"use client";

import type React from "react";
import ThemeProvider from "./theme-provider";
import { CartProvider } from "./cart-provider";
import { FavoritesProvider } from "./favourite-items";
import { SiteHeader } from "./site-header";
import SiteFooter from "./site-footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <FavoritesProvider>
            <div className="min-h-screen flex flex-col page-background">
              <SiteHeader />
              <main className="mx-auto max-w-screen-2xl 2xl:max-w-[1680px] px-2 md:px-4">{children}</main>
              <SiteFooter />
            </div>
          </FavoritesProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
