import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../lib/theme-store";

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  // عند الضغط: إذا كان داكن يصبح فاتح والعكس
  const toggleTheme = () => {
    if (
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  // مزامنة الكلاس مع الـ html
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }
  }, [theme]);

  return (
    <button
      aria-label="تبديل الوضع الليلي"
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      onClick={toggleTheme}
    >
      {theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches) ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
