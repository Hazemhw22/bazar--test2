"use client";

import Link from "next/link";
import { X, User, History, Wallet, Bell, Heart, Gift, Search, Settings } from "lucide-react";
import { useEffect } from "react";
import { Profile } from "@/lib/type";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  user: Profile | null;
}

const menuItems = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/orders/history", label: "Orders", icon: History },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/favourite", label: "Favourite", icon: Heart },
  { href: "/invite", label: "Invite Friends", icon: Gift },
  { href: "/restaurants", label: "Restaurants", icon: Search },
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

        <div className="px-4 py-3 text-xs text-muted-foreground tracking-wide">MENU</div>

        <nav className="px-2 pb-4">
          {menuItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent active:bg-accent/80">
              <Icon size={18} className="text-muted-foreground" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-4 py-3 text-xs text-muted-foreground tracking-wide">SETTINGS AND SUPPORT</div>
        <div className="px-2 pb-28">
          <Link href="/settings" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent">
            <Settings size={18} />
            <span>Settings and Privacy</span>
          </Link>
          <Link href="/help" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent">
            <Search size={18} />
            <span>Help center</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}


