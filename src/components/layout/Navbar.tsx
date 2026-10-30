import React, { useState, useRef, useEffect } from "react";
import { Menu, Search, User, Settings, LogOut, HelpCircle } from "lucide-react";
import { ToggleTheme } from "@/components/ui";
import avatar from "@/assets/images/avatar.jpg";

export interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenSearch?: () => void;
  currentRouteTitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenSearch,
  currentRouteTitle = "Dashboard",
  breadcrumbs = [{ label: "App" }, { label: "Dashboard" }],
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-15 flex items-center justify-between gap-4 px-4 sm:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-xs">
      {/* Left Zone: Sidebar Hamburger + Contextual Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Trail */}
        <nav
          aria-label="Breadcrumb"
          className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label + idx}>
              {idx > 0 && (
                <span className="text-slate-300 dark:text-slate-600">/</span>
              )}
              <span
                className={
                  idx === breadcrumbs.length - 1
                    ? "text-slate-900 dark:text-slate-100 font-semibold truncate"
                    : "truncate"
                }>
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </nav>

        <span className="sm:hidden text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
          {currentRouteTitle}
        </span>
      </div>

      {/* Right Zone: Search trigger + Theme toggle + Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Search Trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Quick search components and pages"
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer">
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <ToggleTheme />

        {/* User Profile Menu with Profile Photo */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            aria-label="User account menu"
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none">
            {/* Profile Photo on Left */}
            <img
              src={avatar}
              alt="Rezaur"
              className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 shadow-2xs"
            />
            <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-200">
              Rezaur Rahman
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 py-1">
              {/* Profile Photo beside Name and Email */}
              <div className="flex items-center gap-3 px-3.5 py-3 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={avatar}
                  alt="Rezaur Rahman"
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-indigo-500/20 shadow-xs"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    Rezaur Rahman
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    rezaur@puc.ac.bd
                  </p>
                </div>
              </div>

              <div className="py-1 text-xs text-slate-700 dark:text-slate-300">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile Overview</span>
                </button>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer">
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Project Settings</span>
                </button>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Documentation</span>
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
