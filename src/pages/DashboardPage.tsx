import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Component,
  Plus,
  Server,
  Users,
} from "lucide-react";
import { CustomButton } from "@/components/ui";
import { ACCENTS } from "@/router/accents";
import { navRoutes } from "@/router/routes";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const quickLinks = navRoutes.filter((route) => route.path !== "/");

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Template Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Modular enterprise starter kit with dynamic routing, pre-wired Axios
            client, and complete component library.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <CustomButton
            variant="outline"
            size="sm"
            leftIcon={<Component className="w-3.5 h-3.5 text-indigo-500" />}
            onClick={() => navigate("/components")}>
            Showcase (18 UI items)
          </CustomButton>

          <CustomButton
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Create Project
          </CustomButton>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Projects
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono tabular-nums">
            0
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono tabular-nums">
              100%
            </span>
            <span>uptime across all nodes</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Monthly Traffic
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono tabular-nums">
            1.02M
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono tabular-nums">
              +14.2%
            </span>
            <span>vs previous 30 days</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Engineers
            </span>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono tabular-nums">
            24
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="text-slate-700 dark:text-slate-300 font-semibold font-mono tabular-nums">
              4 teams
            </span>
            <span>in platform workspace</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Template Components
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Component className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono tabular-nums">
            18
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              100% typed
            </span>
            <span>with TypeScript props</span>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards (generated from src/router/routes.ts) */}
      {quickLinks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((route) => {
            const Icon = route.icon;
            const accent = ACCENTS[route.accent ?? "indigo"];
            return (
              <Link
                key={route.path}
                to={route.path}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm transition-all cursor-pointer group flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${accent.card}`} />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {route.label}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {route.description}
                  </p>
                </div>
                <ArrowRight
                  className={`w-4 h-4 text-slate-400 ${accent.cardArrow} group-hover:translate-x-0.5 transition-all mt-0.5`}
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
