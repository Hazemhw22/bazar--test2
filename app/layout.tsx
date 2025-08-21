import type React from "react";
import "./globals.css";
import AppProviders from "../components/AppProviders";
import BreadcrumbsNav from "../components/BreadcrumbsNav";
import FixedButtons from "../components/fixed-buttons"; // تأكد من الاستيراد

export const metadata = {
  title: "Vristo",
  description: "Next.js + Tailwind UI Store",
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
          <FixedButtons /> {/* ✅ هنا فوق الـ BreadcrumbsNav */}
          <BreadcrumbsNav />
          <main className=" max-w-7xl mx-auto">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
