"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SupportedLocale = "ar" | "en" | "he";

type Messages = Record<string, string>;

type I18nContextValue = {
  locale: SupportedLocale;
  direction: "rtl" | "ltr";
  t: (key: string, values?: Record<string, string | number>) => string;
  setLocale: (locale: SupportedLocale) => void;
};


const I18nContext = createContext<I18nContextValue | null>(null);

const RTL_LOCALES: SupportedLocale[] = ["ar", "he"];

const DEFAULT_LOCALE: SupportedLocale = "ar";

function computeDirection(locale: SupportedLocale): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

async function importMessages(locale: SupportedLocale): Promise<Messages> {
  switch (locale) {
    case "ar":
      return (await import("../locales/ar.json")).default as Messages;
    case "he":
      return (await import("../locales/he.json")).default as Messages;
    case "en":
    default:
      return (await import("../locales/en.json")).default as Messages;
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [messages, setMessages] = useState<Messages>({});

  // Initial locale from localStorage (client-side only)
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as SupportedLocale | null;
    const initial = (saved ?? DEFAULT_LOCALE) as SupportedLocale;
    setLocaleState(initial);
  }, []);

  // Load messages when locale changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await importMessages(locale);
      if (!cancelled) setMessages(loaded);
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const setLocale = useCallback((next: SupportedLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem("lang", next);
    } catch {}
  }, []);

  const t = useCallback(
  (key: string, values?: Record<string, string | number>) => {
    let text = messages[key] ?? key;

    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        // Use split/join to avoid constructing potentially invalid RegExp patterns
        text = text.split("{" + k + "}").join(String(v));
      });
    }

    return text;
  },
  [messages]
);



  const value = useMemo<I18nContextValue>(
    () => ({ locale, direction: computeDirection(locale), t, setLocale }),
    [locale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function HtmlLangDirSync() {
  const { locale, direction } = useI18n();
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", locale);
      document.documentElement.setAttribute("dir", direction);
    }
  }, [locale, direction]);
  return null;
}

export const supportedLanguages: Array<{ code: SupportedLocale; label: string; flag: string }> = [
  { code: "ar", label: "العربية", flag: "https://flagcdn.com/w40/ae.png" },
  { code: "he", label: "עברית", flag: "https://flagcdn.com/w40/il.png" },
  { code: "en", label: "English", flag: "https://flagcdn.com/w40/us.png" },
];


