"use client";

import { useMemo } from "react";
import { useI18n, supportedLanguages } from "../lib/i18n";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  const currentLangData = useMemo(() => {
    return supportedLanguages.find((l) => l.code === locale) || supportedLanguages[0];
  }, [locale]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 cursor-pointer  rounded-full " aria-label="Language selector">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-semibold">
            {String(currentLangData.code).toUpperCase()}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto py-1">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => setLocale(lang.code as any)} className="flex items-center gap-2 py-1 px-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold">
              {String(lang.code).toUpperCase()}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
