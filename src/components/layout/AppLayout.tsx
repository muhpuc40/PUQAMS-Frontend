import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Preloader, SpinLoader, TitleHandler } from '@/components/ui';
import { findRoute } from '@/router/routes';
import CommandSearch from './CommandSearch';
import Footer from './Footer';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DEFAULT_BREADCRUMB_ROOT = 'App';

/**
 * App shell: sidebar + navbar + footer around the active page (<Outlet />).
 * Title, breadcrumbs and menu state all come from `src/router/routes.ts`.
 */
export const AppLayout: React.FC = () => {
  const { pathname } = useLocation();
  const route = findRoute(pathname);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const title = route?.title ?? 'Dashboard';
  const breadcrumbs = (route?.breadcrumbs ?? [DEFAULT_BREADCRUMB_ROOT, route?.label ?? title]).map(
    (label) => ({ label })
  );

  // Every navigation: close the mobile drawer and scroll to top
  useEffect(() => {
    setIsOpenMobile(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  // Lock page scrolling while the mobile sidebar is open
  useEffect(() => {
    if (!isOpenMobile) return;

    const scrollY = window.scrollY || document.documentElement.scrollTop;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpenMobile]);

  // Hamburger: collapse on desktop, open drawer on mobile
  const handleToggleSidebar = () => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (isDesktop) setIsCollapsedDesktop((prev) => !prev);
    else setIsOpenMobile((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Preloader
        isLoading={isInitialLoading}
        showProgress={true}
        duration={900}
        onComplete={() => setIsInitialLoading(false)}
      />

      <TitleHandler title={title} description={route?.description} />

      <Sidebar
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isCollapsedDesktop={isCollapsedDesktop}
        onToggleCollapse={() => setIsCollapsedDesktop((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsedDesktop ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          onOpenSearch={() => setIsSearchOpen(true)}
          currentRouteTitle={title}
          breadcrumbs={breadcrumbs}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-24">
                <SpinLoader size="lg" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>

        <Footer />
      </div>

      <CommandSearch
        isOpen={isSearchOpen}
        onOpen={() => setIsSearchOpen(true)}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
