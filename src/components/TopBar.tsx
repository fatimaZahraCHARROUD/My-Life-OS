import { X, Pin } from "lucide-react";
import { useWorkspace } from "../store/workspace";

export default function TopBar() {
  const openTabs = useWorkspace((s) => s.openTabs);
  const activePageId = useWorkspace((s) => s.activePageId);
  const setActivePage = useWorkspace((s) => s.setActivePage);
  const removeTab = useWorkspace((s) => s.removeTab);
  const toggleTabPin = useWorkspace((s) => s.toggleTabPin);
  const pages = useWorkspace((s) => s.pages);
  const getBreadcrumbs = useWorkspace((s) => s.getBreadcrumbs);

  // Sort tabs so pinned ones are always on the left
  const sortedTabs = [...openTabs].sort((a, b) => {
    const pageA = pages.find((p) => p.id === a);
    const pageB = pages.find((p) => p.id === b);
    if (pageA?.isTabPinned && !pageB?.isTabPinned) return -1;
    if (!pageA?.isTabPinned && pageB?.isTabPinned) return 1;
    return 0;
  });

  const activePage = pages.find((p) => p.id === activePageId);
  const crumbs = activePage ? getBreadcrumbs(activePage.id) : [];

  return (
    <div className="flex flex-col border-b border-rose-200/60 dark:border-plum-600/60 bg-white/40 dark:bg-plum-900/40">
      {/* TABS */}
      <div className="flex items-center gap-1 px-2 pt-2 overflow-x-auto no-scrollbar">
        {sortedTabs.map((tabId) => {
          const page = pages.find((p) => p.id === tabId);
          if (!page) return null;
          const isActive = tabId === activePageId;
          const isPinned = page.isTabPinned;
          
          return (
            <div
              key={tabId}
              onClick={() => setActivePage(tabId)}
              className={[
                "group flex items-center gap-2 py-1.5 text-sm cursor-pointer border-t border-x transition-all",
                isPinned ? "px-2.5 rounded-t-md" : "px-3 rounded-t-lg",
                isActive
                  ? "bg-blush-50 dark:bg-plum-800 border-rose-200 dark:border-plum-600 text-burgundy-800 dark:text-rose-100 font-medium"
                  : "bg-transparent border-transparent text-burgundy-500 dark:text-rose-300/60 hover:bg-rose-100/50 dark:hover:bg-plum-700/50"
              ].join(" ")}
            >
{page.icon ? <span>{page.icon}</span> : <span>📄</span>}              
              {/* Only show title if NOT pinned */}
              {!isPinned && <span className="truncate max-w-[120px]">{page.title}</span>}

              {/* Show close button ONLY if NOT pinned */}
              {!isPinned && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeTab(tabId); }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-rose-200 dark:hover:bg-plum-600 rounded p-0.5 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Show pin button on hover if NOT pinned */}
              {!isPinned && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleTabPin(tabId); }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-rose-200 dark:hover:bg-plum-600 rounded p-0.5"
                  title="Pin tab"
                >
                  <Pin className="w-3 h-3" />
                </button>
              )}

              {/* Show unpin button on hover if PINNED */}
              {isPinned && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleTabPin(tabId); }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-rose-200 dark:hover:bg-plum-600 rounded p-0.5 ml-1"
                  title="Unpin tab"
                >
                  <Pin className="w-3 h-3" fill="currentColor" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* BREADCRUMBS / PATH */}
      {activePage && (
        <div className="flex items-center gap-2 px-6 py-3 text-sm text-burgundy-500 dark:text-rose-300/60">
          {crumbs.map((c, i) => (
            <span key={c.id} className="flex items-center gap-1.5">
              {i > 0 && <span className="opacity-50">/</span>}
              <span 
                className="hover:text-burgundy-800 dark:hover:text-rose-100 cursor-pointer flex items-center gap-1"
                onClick={() => setActivePage(c.id)}
              >
                <span>{c.icon}</span>
                <span>{c.title}</span>
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}