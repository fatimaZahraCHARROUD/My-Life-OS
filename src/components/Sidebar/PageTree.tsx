import { useState } from "react";
import { Plus, Archive } from "lucide-react";
import { useWorkspace } from "../../store/workspace";
import PageNode from "./PageNode";

export default function PageTree({ collapsed }: { collapsed: boolean }) {
  const pages = useWorkspace((s) => s.pages);
  const addRootPage = useWorkspace((s) => s.addRootPage);
  const movePage = useWorkspace((s) => s.movePage);
  const setActivePage = useWorkspace((s) => s.setActivePage);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const roots = pages
    .filter((p) => !p.archived && p.parentId === null)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.title.localeCompare(b.title);
    });

  const archivedPages = pages.filter((p) => p.archived);

  return (
    <div>
      {roots.map((p) => (
        <PageNode
          key={p.id}
          page={p}
          level={0}
          collapsed={collapsed}
          draggingId={draggingId}
          onDragStart={(id) => setDraggingId(id)}
          onDropOn={(dragId, targetId, position) => {
            movePage(dragId, targetId, position);
            setDraggingId(null);
          }}
        />
      ))}

      {!collapsed && (
        <button
          onClick={() => addRootPage({ title: "Untitled", icon: "📄" })}
          className="mt-2 w-full flex items-center gap-2 text-xs text-burgundy-500 dark:text-rose-300/70 hover:text-burgundy-700 dark:hover:text-rose-100 px-2 py-1.5 rounded hover:bg-rose-100/60 dark:hover:bg-plum-700/60 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New page</span>
        </button>
      )}

      {/* ARCHIVED SECTION */}
      {archivedPages.length > 0 && !collapsed && (
        <div className="mt-6 pt-4 border-t border-rose-200/60 dark:border-plum-600/60">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-xs font-semibold text-burgundy-400 dark:text-rose-300/50 uppercase tracking-wider mb-2 px-2 w-full hover:text-burgundy-600"
          >
            <Archive className="w-3.5 h-3.5" />
            Archived ({archivedPages.length})
          </button>
          {showArchived && archivedPages.map((p) => (
            <div 
              key={p.id}
              onClick={() => setActivePage(p.id)}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-burgundy-500 dark:text-rose-300/60 hover:bg-rose-100/50 dark:hover:bg-plum-700/50 rounded cursor-pointer truncate"
            >
              <span>{p.icon}</span>
              <span className="truncate">{p.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}