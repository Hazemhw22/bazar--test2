"use client";

import Link from "next/link";
import { X, User, History, Wallet, Bell, Heart, Gift, Headphones, Settings } from "lucide-react";
import { useEffect } from "react";
import { Profile } from "@/lib/type";
import { useI18n } from "../lib/i18n";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  user: Profile | null;
}

const menuItems = [
  { href: "/account", key: "menu.profile", icon: User },
  { href: "/orders", key: "menu.orders", icon: History },
  { href: "/wallet", key: "menu.wallet", icon: Wallet },
  { href: "/notifications", key: "menu.notifications", icon: Bell },
  { href: "/favourite", key: "menu.favourite", icon: Heart },
  { href: "/invite", key: "menu.invite", icon: Gift },
];

export default function MobileSidebar({ open, onClose, user }: MobileSidebarProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const { t } = useI18n();

  return (
    <div className={`fixed inset-0 z-[100] md:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer - right side */}
      <aside
        className={`absolute top-0 bottom-0 right-0 w-[88%] max-w-sm bg-card text-foreground shadow-2xl border-l border-border transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ willChange: "transform" }}
      >
        <div className="px-4 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-border">
              <img src={user?.avatar_url || "/AVATAR1.png"} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{user?.full_name || "Guest"}</div>
              <div className="text-xs text-primary">View profile</div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-accent">
              <X size={18} />
            </button>
          </div>
        </div>

  <div className="px-4 py-3 text-xs text-muted-foreground tracking-wide">{t("menu.title")}</div>

        <nav className="px-2 pb-4">
          {menuItems.map(({ href, key, icon: Icon }) => (
            <Link key={href} href={href} onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent active:bg-accent/80">
              <Icon size={18} className="text-muted-foreground" />
              <span>{t(key)}</span>
            </Link>
          ))}
        </nav>

        <div className="px-4 py-3 text-xs text-muted-foreground tracking-wide">{t("menu.supportTitle")}</div>
        <div className="px-2 pb-28">
          <Link href="/settings" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent">
            <Settings size={18} />
            <span>{t("menu.settings")}</span>
          </Link>
          <Link href="/help" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent">
            <Headphones size={18} />
            <span>{t("menu.help")}</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}


