"use client";

import { useMemo } from "react";
import Image from "next/image";
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
        <div className="flex items-center gap-1 cursor-pointer">
          <Image
            src={currentLangData.flag}
            alt={currentLangData.label}
            width={24}
            height={24}
            className="w-5 h-5 rounded-full"
            unoptimized
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-30">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code as any)}
            className="flex items-center gap-2"
          >
            <Image
              src={lang.flag}
              alt={lang.label}
              width={20}
              height={20}
              className="w-5 h-5 rounded-full"
              unoptimized
            />
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
