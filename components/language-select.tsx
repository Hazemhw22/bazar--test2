"use client";

import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu"

const languages = [
  { code: "ar", label: "العربية", flag: "https://flagcdn.com/w40/ae.png" },
  { code: "he", label: "עברית", flag: "https://flagcdn.com/w40/il.png" },
  { code: "en", label: "English", flag: "https://flagcdn.com/w40/us.png" },
]

export function LanguageSelector() {
  // تخزين اللغة الحالية، ممكن تطويرها لتكون من السياق أو من localStorage
  const currentLang = typeof window !== "undefined" ? localStorage.getItem("lang") || "en" : "en"
  const currentLangData = languages.find((l) => l.code === currentLang) || languages[2]

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
            unoptimized // إذا لم تضبط next.config.js للسماح بالدومينات الخارجية
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-30">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              localStorage.setItem("lang", lang.code)
              // إعادة تحميل الصفحة لتطبيق التغيير
              window.location.reload()
            }}
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
  )
}
