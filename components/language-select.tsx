"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";

const languages = [
  { code: "ar", label: "العربية", flag: "https://flagcdn.com/w40/ae.png" },
  { code: "he", label: "עברית", flag: "https://flagcdn.com/w40/il.png" },
  { code: "en", label: "English", flag: "https://flagcdn.com/w40/us.png" },
];

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setCurrentLang(saved);
  }, []);

  const currentLangData =
    languages.find((l) => l.code === currentLang) || languages[2];

  const handleSelect = (langCode: string) => {
    localStorage.setItem("lang", langCode);
    setCurrentLang(langCode);
  };

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
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
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
