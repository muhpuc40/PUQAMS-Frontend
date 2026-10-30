import React from "react";
import { Link, NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { navRoutes } from "@/router/routes";
import puLogo from "@/assets/puc.png";
export interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapse: () => void;
}

const DEFAULT_BADGE =
  "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";

/** The menu is generated from `src/router/routes.ts` – nothing to edit here. */
export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapse,
}) => {
  const firstPath = navRoutes[0]?.path ?? "/";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsedDesktop ? "lg:w-20" : "lg:w-64"} w-72`}>
        {/* Brand / Logo Header */}
        <div
          className={`h-15 flex items-center border-b border-slate-100 dark:border-slate-800 ${isCollapsedDesktop ? "justify-between px-3" : "justify-between px-4 sm:px-5"}`}>
          <Link
            to={firstPath}
            onClick={onCloseMobile}
            title={
              isCollapsedDesktop ? "React Pro UI Starter Template" : undefined
            }
            className="flex items-center gap-2.5 cursor-pointer select-none overflow-hidden">
            <div className="w-12 h-11 flex items-center justify-center shrink-0">
              <img
                src={puLogo}
                alt="Premier University"
                className="w-full h-full object-contain"
              />
            </div>
            {!isCollapsedDesktop && (
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight truncate">
                  QAMS
                </span>
              </div>
            )}
          </Link>

          <div className="flex items-center gap-1">
            {/* Desktop collapse toggle */}

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close mobile sidebar"
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            {!isCollapsedDesktop && (
              <p className="px-3 mb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Pages & Navigation
              </p>
            )}

            <nav className="space-y-1">
              {navRoutes.map((route) => {
                const Icon = route.icon;

                return (
                  <div key={route.path} className="relative group space-y-1">
                    <NavLink
                      to={route.path}
                      end
                      onClick={onCloseMobile}
                      title={route.label}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none text-left ${
                          isCollapsedDesktop ? "justify-center px-0" : "px-3"
                        } ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold shadow-2xs"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                        }`
                      }>
                      {({ isActive }) => (
                        <>
                          <div
                            className={
                              isActive
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-400"
                            }>
                            <Icon className="w-4 h-4 shrink-0" />
                          </div>

                          {!isCollapsedDesktop && (
                            <div className="flex-1 flex items-center justify-between min-w-0">
                              <span className="truncate">{route.label}</span>
                              {route.badge && (
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                                    route.badgeColor || DEFAULT_BADGE
                                  }`}>
                                  {route.badge}
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>

                    {/* Collapsed mode: hover popover */}
                    {isCollapsedDesktop && (
                      <div className="hidden lg:group-hover:flex absolute left-full top-0 ml-2 z-50 flex-col min-w-[220px] p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl pointer-events-none group-hover:pointer-events-auto animate-in fade-in-50 zoom-in-95 duration-150">
                        <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {route.label}
                          </span>
                          {route.badge && (
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                route.badgeColor ||
                                "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              }`}>
                              {route.badge}
                            </span>
                          )}
                        </div>
                        <Link
                          to={route.path}
                          onClick={onCloseMobile}
                          className="w-full text-left py-1.5 px-2.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium">
                          Go to page →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
