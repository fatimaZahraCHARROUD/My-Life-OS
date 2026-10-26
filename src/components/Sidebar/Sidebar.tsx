import { useEffect, useState } from "react";
import {
  Sparkles,
   Home,
  Zap,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useWorkspace } from "../../store/workspace";
 import InlineSearch from "./InlineSearch";
import PageTree from "./PageTree";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("myLifeOS.theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function Sidebar() {
  const sidebarCollapsed = useWorkspace((s) => s.sidebarCollapsed);
  const toggleSidebar = useWorkspace((s) => s.toggleSidebar);
  const setActivePage = useWorkspace((s) => s.setActivePage);
  const activePageId = useWorkspace((s) => s.activePageId);

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("myLifeOS.theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <aside
      className={[
        "flex flex-col h-full border-r transition-all duration-200",
        "bg-white/70 dark:bg-plum-900/70 backdrop-blur-sm",
        "border-rose-200/60 dark:border-plum-600/60",
        sidebarCollapsed ? "w-[64px]" : "w-[264px]",
      ].join(" ")}
    >
      {/* Header: logo + collapse button */}
      <div
        className={[
          "flex items-center gap-2 px-3 h-14 border-b",
          "border-rose-200/60 dark:border-plum-600/60",
          sidebarCollapsed ? "justify-center" : "justify-between",
        ].join(" ")}
      >
        {!sidebarCollapsed && (
          <button
onClick={() => window.dispatchEvent(new Event("go-home"))}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Go home"
          >
            <Sparkles className="w-5 h-5 text-burgundy-600 dark:text-rose-300" />
            <span className="font-semibold tracking-tight text-burgundy-800 dark:text-rose-100">
              My Life OS
            </span>
          </button>
        )}
        <button
          onClick={toggleSidebar}
          className="btn-ghost p-1.5 rounded-md"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {/* Search placeholder (Stage 6 wires Ctrl+K) */}
      {!sidebarCollapsed && (
  <InlineSearch onPick={(id) => setActivePage(id)} />
)}

        {/* Primary nav */}
        <nav className="space-y-0.5 mb-4">
          <SidebarNavItem
            icon={<Home className="w-4 h-4" />}
            label="Home"
            collapsed={sidebarCollapsed}
            active={activePageId === null}
            onClick={() => window.dispatchEvent(new Event("go-home"))}
          />
          <SidebarNavItem
            icon={<Zap className="w-4 h-4" />}
            label="Quick Capture"
            collapsed={sidebarCollapsed}
            active={false}
            onClick={() => {
              /* wired in Stage 6 */
            }}
            disabled
          />
        </nav>

        {/* Workspace section — category tree goes here in 2C */}
        <div className="mt-2">
          {!sidebarCollapsed && (
            <div className="px-2 mb-1 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-burgundy-400 dark:text-rose-300/60">
                Your Workspace
              </span>
            </div>
          )}
<PageTree collapsed={sidebarCollapsed} />
        </div>
      </div>

      {/* Footer: settings + theme toggle */}
      <div
        className={[
          "flex items-center gap-1 px-2 h-12 border-t",
          "border-rose-200/60 dark:border-plum-600/60",
          sidebarCollapsed
            ? "flex-col justify-center h-auto py-2 gap-1"
            : "justify-between",
        ].join(" ")}
      >
        <button
          className="btn-ghost p-1.5 rounded-md flex items-center gap-2 text-sm"
          title="Settings (coming later)"
          onClick={() => window.dispatchEvent(new Event("go-settings"))}
        >
          <Settings className="w-4 h-4" />
          {!sidebarCollapsed && <span>Settings</span>}
        </button>
        <button
          onClick={toggleTheme}
          className="btn-ghost p-1.5 rounded-md flex items-center gap-2 text-sm"
          title={theme === "light" ? "Switch to dark" : "Switch to light"}
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
          {!sidebarCollapsed && (
            <span>{theme === "light" ? "Dark" : "Light"}</span>
          )}
        </button>
      </div>
    </aside>
  );
}

function SidebarNavItem({
  icon,
  label,
  collapsed,
  active,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={[
        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors",
        collapsed ? "justify-center" : "",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-rose-100/60 dark:hover:bg-plum-700/60",
        active
          ? "bg-rose-100 text-burgundy-800 dark:bg-plum-700 dark:text-rose-100 font-medium"
          : "text-burgundy-700 dark:text-rose-200",
      ].join(" ")}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}
