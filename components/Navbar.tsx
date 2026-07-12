"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, ChevronDown, Flame, LogOut, Menu, Settings, User, X } from "lucide-react";
import { Logo } from "./Illustrations";
import { useLogout } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavLink {
  label: string;
  active?: boolean;
  hasCaret?: boolean;
}

interface Notification {
  title: string;
  time: string;
}

const NAV_ITEMS: NavLink[] = [
  { label: "Dashboard" },
  { label: "Guesstimates" },
  { label: "SQL Practice", active: true },
  { label: "Courses" },
  { label: "Resources", hasCaret: true },
  { label: "Track Progress" },
];

const NOTIFICATIONS: Notification[] = [
  { title: "Your SQL mock was evaluated", time: "2h ago" },
  { title: "New Window Functions set added", time: "1d ago" },
  { title: "You're on a 12-day streak 🔥", time: "1d ago" },
];

interface NavItemProps extends NavLink {
  onClick?: () => void;
}

function NavItem({ label, active, hasCaret, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1 text-[14.5px] font-medium pb-1 ${
        active ? "text-carrot" : "text-ink/70 hover:text-ink"
      }`}
    >
      {label}
      {hasCaret && <ChevronDown size={15} strokeWidth={2} />}
      {active && (
        <span className="absolute -bottom-[19px] left-0 right-0 h-[2.5px] rounded-full bg-carrot" />
      )}
    </button>
  );
}

export default function Navbar() {
  const [current, setCurrent] = useState("SQL Practice");
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const logout = useLogout();
  const user = useAuthStore((s) => s.user);

  const displayName = user?.email ? user.email.split("@")[0] : "Guest";
  const initial = displayName.charAt(0).toUpperCase();

  function handleLogout() {
    logout.mutate(undefined, { onSettled: () => router.push("/login") });
  }

  return (
    <header className="bg-white/70 backdrop-blur border-b border-black/[0.06] sticky top-0 z-40">
      <div className="px-6 min-h-[60px] flex items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item: NavLink) => (
            <NavItem
              key={item.label}
              {...item}
              active={current === item.label}
              onClick={() => setCurrent(item.label)}
            />
          ))}
        </nav>

        <div className="flex items-center gap-3.5">
          <Badge className="gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[13px] font-bold text-carrot hover:bg-orange-50">
            <Flame size={15} fill="currentColor" strokeWidth={0} /> 12
          </Badge>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className="relative h-9 w-9 rounded-full text-ink/55"
              >
                <Bell size={19} />
                <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-carrot ring-2 ring-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px] p-2 shadow-soft">
              <p className="px-2 py-1.5 text-[13px] font-bold text-ink">Notifications</p>
              <div className="divide-y divide-black/[0.05]">
                {NOTIFICATIONS.map((n: Notification) => (
                  <div key={n.title} className="flex items-start gap-2.5 px-2 py-2.5">
                    <span className="mt-0.5 grid place-items-center w-7 h-7 rounded-lg bg-brand-soft text-brand shrink-0">
                      <Bell size={13} />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-semibold text-ink leading-snug">{n.title}</p>
                      <p className="text-[11px] text-body">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="group flex h-auto items-center gap-2 rounded-full py-1 pl-1 pr-1.5"
              >
                <span className="grid place-items-center w-7 h-7 rounded-full bg-brand text-white text-[12px] font-bold">
                  {initial}
                </span>
                <span className="hidden sm:block text-[14px] font-semibold capitalize">{displayName}</span>
                <ChevronDown
                  size={15}
                  strokeWidth={2}
                  className="text-ink/50 transition-transform group-data-[state=open]:rotate-180"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] p-1.5 shadow-soft">
              <DropdownMenuLabel className="px-2.5 py-2">
                <p className="text-[13px] font-bold text-ink capitalize">{displayName}</p>
                <p className="text-[11.5px] font-normal text-body">{user?.email ?? "Not signed in"}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="h-9 gap-2.5 text-[13px] text-ink/80">
                <User size={15} className="text-ink/55" /> My Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="h-9 gap-2.5 text-[13px] text-ink/80">
                <Settings size={15} className="text-ink/55" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
                disabled={logout.isPending}
                className="h-9 gap-2.5 text-[13px] text-rose-500"
              >
                <LogOut size={15} /> {logout.isPending ? "Logging out…" : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden h-9 w-9 rounded-full text-ink/70"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-black/[0.06] bg-white px-6 py-3 space-y-0.5">
          {NAV_ITEMS.map((item: NavLink) => (
            <button
              key={item.label}
              onClick={() => {
                setCurrent(item.label);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-lg px-3 h-11 text-[14.5px] font-medium ${
                current === item.label ? "bg-orange-50 text-carrot" : "text-ink/75 hover:bg-black/[0.03]"
              }`}
            >
              {item.label}
              {current === item.label && <Check size={16} />}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
