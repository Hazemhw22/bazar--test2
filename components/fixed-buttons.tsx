// components/fixed-buttons.tsx
"use client";
import { Download, History, User } from "lucide-react";

export default function FixedButtons({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex justify-around items-center py-2 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 border-b border-border shadow-sm mb-2 ${className}`}
    >
      <button className="flex flex-col items-center text-xs">
        <Download className="w-5 h-5 mb-1" />
        تثبيت التطبيق
      </button>
      <button className="flex flex-col items-center text-xs">
        <History className="w-5 h-5 mb-1" />
        طلباتي السابقة
      </button>
      <button className="flex flex-col items-center text-xs">
        <User className="w-5 h-5 mb-1" />
        تسجيل دخول
      </button>
    </div>
  );
}
