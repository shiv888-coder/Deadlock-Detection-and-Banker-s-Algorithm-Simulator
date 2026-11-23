import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Radar,
  SlidersHorizontal,
  PlaySquare,
  BookOpen,
  FolderKanban,
  HelpCircle,
  Info,
  Sun,
  Moon,
  Menu,
  X,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';

interface NavItem {
  to: string;
  label: string;
  section: 'workspace' | 'reference';
  Icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', section: 'workspace', Icon: LayoutDashboard },
  { to: '/bankers', label: "Banker's Algorithm", section: 'workspace', Icon: ShieldCheck },
  { to: '/deadlock-detection', label: 'Deadlock Detection', section: 'workspace', Icon: Radar },
  {
    to: '/resource-allocation',
    label: 'Resource Allocation',
    section: 'workspace',
    Icon: SlidersHorizontal,
  },
  {
    to: '/simulation',
    label: 'Step-by-Step Simulation',
    section: 'workspace',
    Icon: PlaySquare,
  },
  { to: '/learn', label: 'Algorithm Explanation', section: 'reference', Icon: BookOpen },
  { to: '/samples', label: 'Sample Problems', section: 'reference', Icon: FolderKanban },
  { to: '/viva', label: 'Viva Questions', section: 'reference', Icon: HelpCircle },
  { to: '/about', label: 'About Project', section: 'reference', Icon: Info },
];

const WORKSPACE_NAV = NAV_ITEMS.filter((n) => n.section === 'workspace');
const REFERENCE_NAV = NAV_ITEMS.filter((n) => n.section === 'reference');
const SIDEBAR_STORAGE_KEY = 'os-sim-sidebar-collapsed-v1';

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, activeScenarioName, systemState } = useSimulator();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const location = useLocation();

  const currentNav =
    NAV_ITEMS.find((item) =>
      item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
    ) ?? NAV_ITEMS[0];

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // ignore storage restrictions
      }
      return next;
    });
  };

  // Close mobile drawer on route change or Escape key
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mobileMenuOpen]);

  const renderLinkGroup = (
    items: NavItem[],
    collapsed: boolean,
    onNavigate?: () => void
  ) => (
    <div className="space-y-1">
      {items.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          aria-label={label}
          className={({ isActive }) =>
            `group flex items-center ${
              collapsed ? 'justify-center px-2' : 'gap-3 px-3'
            } rounded-lg py-2.5 text-sm font-medium transition-all duration-150 whitespace-nowrap ${
              isActive
                ? 'bg-gradient-to-r from-[#0b1834] to-[#17336b] text-white dark:from-blue-600 dark:to-cyan-600 shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-[#13254a] dark:hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-cyan-300 dark:text-white'
                    : 'text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-cyan-300'
                }`}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );

  const renderNav = (collapsed: boolean, onNavigate?: () => void) => (
    <nav
      aria-label="Main navigation"
      className="flex-1 overflow-y-auto px-3 py-4 space-y-5"
    >
      <div>
        {!collapsed && (
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wide text-slate-400 dark:text-slate-500">
            Simulator Modules
          </div>
        )}
        {renderLinkGroup(WORKSPACE_NAV, collapsed, onNavigate)}
      </div>

      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/90">
        {!collapsed && (
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wide text-slate-400 dark:text-slate-500">
            Learning &amp; Project
          </div>
        )}
        {renderLinkGroup(REFERENCE_NAV, collapsed, onNavigate)}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-[#060e1f] dark:text-slate-100 transition-colors">
      {/* Collapsible Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0a152c] transition-all duration-200 z-40 ${
          sidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-64'
        }`}
      >
        <div
          className={`h-16 flex items-center ${
            sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          } border-b border-slate-200/90 dark:border-slate-800/90 shrink-0`}
        >
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#0b1834] via-[#16336d] to-cyan-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Cpu className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-sm font-bold text-slate-950 dark:text-white truncate">
                  OS Deadlock Lab
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Banker&apos;s Simulator
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#13254a] transition-colors cursor-pointer shrink-0"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {renderNav(sidebarCollapsed)}

        <div
          className={`p-4 border-t border-slate-200/90 dark:border-slate-800/90 text-xs text-slate-500 dark:text-slate-400 ${
            sidebarCollapsed ? 'text-center px-2' : 'space-y-0.5'
          }`}
        >
          {sidebarCollapsed ? (
            <div
              className="font-mono font-semibold text-[11px] text-slate-600 dark:text-slate-300"
              title="B.Tech CSE · Group 9 · Operating System Mini-Project"
            >
              G9
            </div>
          ) : (
            <>
              <div className="font-semibold text-slate-700 dark:text-slate-200">
                B.Tech CSE · Group 9
              </div>
              <div>Operating System Mini-Project</div>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] flex flex-col bg-white dark:bg-[#0a152c] border-r border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#0b1834] via-[#16336d] to-cyan-600 flex items-center justify-center text-white shrink-0">
                  <Cpu className="h-4 w-4" />
                </div>
                <span className="font-display text-sm font-bold text-slate-950 dark:text-white truncate">
                  OS Deadlock Lab
                </span>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {renderNav(false, () => setMobileMenuOpen(false))}

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50/70 dark:bg-[#081124]">
              <div className="font-medium text-slate-700 dark:text-slate-200 truncate">
                {activeScenarioName}
              </div>
              <div className="font-mono tabular-nums">
                {systemState.processNames.length} Processes · {systemState.resourceNames.length}{' '}
                Resources
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-64'
        }`}
      >
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-14 lg:h-16 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#0a152c]/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1.5 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden sm:inline text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Simulator
              </span>
              <span
                aria-hidden="true"
                className="hidden sm:inline text-slate-300 dark:text-slate-600"
              >
                /
              </span>
              <span className="font-display font-semibold text-slate-950 dark:text-white truncate">
                {currentNav.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 max-w-[260px] truncate">
              <span
                className="truncate font-medium text-slate-700 dark:text-slate-200"
                title={activeScenarioName}
              >
                {activeScenarioName}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums whitespace-nowrap text-cyan-700 dark:text-cyan-400 font-medium">
                {systemState.processNames.length}P × {systemState.resourceNames.length}R
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700/90 bg-white dark:bg-[#112244] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#172d59] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-[#0b1834]" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
