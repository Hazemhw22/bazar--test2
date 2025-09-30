import type React from "react";
import "./globals.css";
import AppProviders from "../components/AppProviders";
import { HtmlLangDirSync } from "../lib/i18n";

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (
                    theme === 'dark' ||
                    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                  ) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.add('light');
                  }
                } catch(e){}
              })();
            `,
          }}
        />
      </head>
      <body className="text-foreground transition-colors duration-300 pb-20 md:pb-0">
        <AppProviders>
          <HtmlLangDirSync />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
