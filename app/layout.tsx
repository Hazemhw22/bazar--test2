import type React from "react";
import "./globals.css";
import AppProviders from "../components/AppProviders";
import BreadcrumbsNav from "../components/BreadcrumbsNav";

export const metadata = {
  title: "Vristo",
  description: "Vristo is a platform for buying and selling products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground transition-colors duration-300">
        <AppProviders>
          <BreadcrumbsNav />
          <main className="mx-auto max-w-screen-2xl 2xl:max-w-[1680px] px-2 md:px-4">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
