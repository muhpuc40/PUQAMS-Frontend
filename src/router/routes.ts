import { Component, LogIn, LayoutDashboard, type LucideIcon } from 'lucide-react';
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { Accent } from './accents';

/**
 * ─────────────────────────────────────────────────────────────
 *  ROUTES  –  the ONLY file you edit to add a new page.
 *
 *  1. Create the page   →  src/pages/MyPage.tsx   (default export)
 *  2. Add one object to the `routes` array below.
 *
 *  The router, the sidebar menu, the Ctrl/⌘+K search, the breadcrumbs,
 *  the document title and the dashboard quick-links are all generated
 *  from this list automatically.
 * ─────────────────────────────────────────────────────────────
 */
export interface AppRoute {
  /** URL path, e.g. '/' or '/reports' */
  path: string;
  /** Sidebar + search label */
  label: string;
  /** Page title (browser tab + mobile navbar) */
  title: string;
  /** Short description (search palette, dashboard quick-links, meta description) */
  description: string;
  /** Any lucide-react icon */
  icon: LucideIcon;
  /** Lazy-loaded page component */
  component: LazyExoticComponent<ComponentType>;
  /** Accent colour used for the icon in search / quick-links (default: indigo) */
  accent?: Accent;
  /** Small pill shown next to the sidebar label */
  badge?: string;
  badgeColor?: string;
  /** Breadcrumb trail. Default: ['App', label] */
  breadcrumbs?: string[];
  /** Set true to keep the page routable but hide it from sidebar / search */
  hidden?: boolean;
}

export const routes: AppRoute[] = [
  {
    path: '/login',
    label: 'Login',
    title: 'Sign In',
    description: 'Authenticate to access the system',
    icon: LogIn,
    hidden: true,
    component: lazy(() => import('@/pages/LoginPage')),
  },
  {
    path: '/',
    label: 'Dashboard',
    title: 'Dashboard Overview',
    description: 'Main metrics, overview & recent activity',
    icon: LayoutDashboard,
    accent: 'indigo',
    breadcrumbs: ['App', 'Dashboard'],
    component: lazy(() => import('@/pages/DashboardPage')),
  },
  {
    path: '/components',
    label: 'All Components',
    title: 'All Components Showcase',
    description: 'Interactive gallery of 18 UI elements',
    icon: Component,
    accent: 'emerald',
    badge: '20 Items',
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
    breadcrumbs: ['App', 'Showcase', 'All Components'],
    component: lazy(() => import('@/pages/AllComponentsPage')),
  },

];

/** Routes that appear in the sidebar / search / dashboard quick-links. */
export const navRoutes = routes.filter((route) => !route.hidden);

/** Find the route that matches the current URL path. */
export const findRoute = (pathname: string): AppRoute | undefined => {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return routes.find((route) => route.path === clean);
};
