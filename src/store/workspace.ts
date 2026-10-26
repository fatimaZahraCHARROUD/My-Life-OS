import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, Page, PageId } from "../types";
import { seedPages, uid } from "../lib/seed";

interface WorkspaceStore {
  pages: Page[];
  expanded: Record<string, boolean>;
  activePageId: PageId | null;
  sidebarCollapsed: boolean;
  hasSeenWelcome: boolean;
  fontSize: number;
  openTabs: PageId[];
   quickTasks: { id: string; text: string; done: boolean }[];


  // selectors
  getActivePage: () => Page | undefined;
  getChildPages: (parentId: PageId | null) => Page[];
  getBreadcrumbs: (pageId: PageId) => Page[];
 addTab: (id: PageId) => void;
  removeTab: (id: PageId) => void;
    setPageCover: (id: PageId, coverUrl: string | undefined) => void;
  setCoverPositionY: (id: PageId, y: number) => void; // <-- ADD THIS
    togglePin: (id: PageId) => void;
  toggleTabPin: (id: PageId) => void;

    addQuickTask: (text: string) => void;
  toggleQuickTask: (id: string) => void;
  deleteQuickTask: (id: string) => void;
    // pages
  addRootPage: (opts?: { title?: string; icon?: string }) => PageId;
  addPage: (opts: {
    title?: string;
    icon?: string;
    parentId: PageId | null;
  }) => PageId;
  renamePage: (id: PageId, title: string) => void;
  setPageContent: (id: PageId, content: unknown[]) => void;
  setPageIcon: (id: PageId, icon: string) => void;
  deletePage: (id: PageId) => void;
  archivePage: (id: PageId) => void;
  movePage: (
    dragId: PageId,
    targetId: PageId,
    position: "inside" | "before" | "after"
  ) => void;

  // ui
  toggleExpanded: (id: string) => void;
  setActivePage: (id: PageId | null) => void;
  toggleSidebar: () => void;
  markWelcomeSeen: () => void;
  setFontSize: (n: number) => void;
  loadSeed: () => void;
  resetAll: () => void;
  migrateCategoriesToPages: () => void;
}

export const useWorkspace = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      pages: seedPages,
      expanded: { pg_quran: true },
      activePageId: null,
      sidebarCollapsed: false,
      hasSeenWelcome: false,
      fontSize: 15,
      openTabs: [],
            quickTasks: [],
      getActivePage: () => {
        const { activePageId, pages } = get();
        return pages.find((p) => p.id === activePageId);
      },

      getChildPages: (parentId) => {
        return get()
          .pages.filter((p) => !p.archived && p.parentId === parentId)
          .sort((a, b) => a.title.localeCompare(b.title));
      },

      getBreadcrumbs: (pageId) => {
        const out: Page[] = [];
        const { pages } = get();
        let cur = pages.find((p) => p.id === pageId);
        while (cur) {
          out.unshift(cur);
          cur = cur.parentId
            ? pages.find((p) => p.id === cur!.parentId)
            : undefined;
        }
        return out;
      },

      addRootPage: ({ title = "Untitled"  } = {}) => {
        const id = uid("pg");
        const page: Page = {
          id,
          title,
           parentId: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          archived: false,
          content: [],
        };
        set((s) => ({
          pages: [...s.pages, page],
          activePageId: id,
        }));
        return id;
      },

      addPage: ({ title = "Untitled", icon = "📄", parentId }) => {
        const id = uid("pg");
        const page: Page = {
          id,
          title,
          icon,
          parentId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          archived: false,
          content: [],
        };
        set((s) => ({
          pages: [...s.pages, page],
          activePageId: id,
          expanded: parentId
            ? { ...s.expanded, [parentId]: true }
            : s.expanded,
        }));
        return id;
      },

      renamePage: (id, title) =>
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id === id
              ? { ...p, title: title.trim() || p.title, updatedAt: Date.now() }
              : p
          ),
        })),

      setPageContent: (id, content) =>
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id === id ? { ...p, content, updatedAt: Date.now() } : p
          ),
        })),

      setPageIcon: (id, icon) =>
        set((s) => ({
          pages: s.pages.map((p) => (p.id === id ? { ...p, icon } : p)),
        })),

      deletePage: (id) =>
        set((s) => {
          const toDelete = new Set<string>([id]);
          let changed = true;
          while (changed) {
            changed = false;
            for (const p of s.pages) {
              if (p.parentId && toDelete.has(p.parentId) && !toDelete.has(p.id)) {
                toDelete.add(p.id);
                changed = true;
              }
            }
          }
          return {
            pages: s.pages.filter((p) => !toDelete.has(p.id)),
            activePageId: toDelete.has(s.activePageId ?? "")
              ? null
              : s.activePageId,
          };
        }),

      archivePage: (id) =>
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id === id ? { ...p, archived: true } : p
          ),
          activePageId: s.activePageId === id ? null : s.activePageId,
        })),
  setCoverPositionY: (id, y) => set((s) => ({
        pages: s.pages.map((p) => p.id === id ? { ...p, coverPositionY: y } : p)
      })),
      movePage: (dragId, targetId, position) =>
        set((s) => {
          if (dragId === targetId) return s;
          const drag = s.pages.find((p) => p.id === dragId);
          const target = s.pages.find((p) => p.id === targetId);
          if (!drag || !target) return s;

          // Prevent dropping a page onto its own descendant
          let check: Page | undefined = target;
          while (check) {
            if (check.id === dragId) return s;
            check = check.parentId
              ? s.pages.find((p) => p.id === check!.parentId)
              : undefined;
          }

          if (position === "inside") {
            return {
              pages: s.pages.map((p) =>
                p.id === dragId ? { ...p, parentId: targetId } : p
              ),
              expanded: { ...s.expanded, [targetId]: true },
            };
          }

          const newParentId = target.parentId ?? null;
          return {
            pages: s.pages.map((p) =>
              p.id === dragId ? { ...p, parentId: newParentId } : p
            ),
          };
        }),

      toggleExpanded: (id) =>
        set((s) => ({
          expanded: { ...s.expanded, [id]: !s.expanded[id] },
        })),

       setActivePage: (id) => set((s) => {
        if (!id) return { activePageId: null };
        const newTabs = s.openTabs.includes(id) ? s.openTabs : [...s.openTabs, id];
        return { activePageId: id, openTabs: newTabs };
      }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      markWelcomeSeen: () => set({ hasSeenWelcome: true }),
      setFontSize: (n) => set({ fontSize: n }),

      loadSeed: () =>
        set({
          pages: seedPages,
          expanded: { pg_quran: true },
          hasSeenWelcome: true,
        }),
         addTab: (id) => set((s) => ({ openTabs: s.openTabs.includes(id) ? s.openTabs : [...s.openTabs, id] })),
      
      removeTab: (id) => set((s) => {
        const newTabs = s.openTabs.filter((t) => t !== id);
        const newActive = s.activePageId === id ? (newTabs[newTabs.length - 1] || null) : s.activePageId;
        return { openTabs: newTabs, activePageId: newActive };
      }),

      setPageCover: (id, coverUrl) => set((s) => ({
        pages: s.pages.map((p) => p.id === id ? { ...p, coverUrl } : p)
      })),

      togglePin: (id) => set((s) => ({
        pages: s.pages.map((p) => p.id === id ? { ...p, isPinned: !p.isPinned } : p)
      })),
  toggleTabPin: (id) => set((s) => ({
        pages: s.pages.map((p) => p.id === id ? { ...p, isTabPinned: !p.isTabPinned } : p)
      })),
            addQuickTask: (text) => set((s) => ({
        quickTasks: [...s.quickTasks, { id: Math.random().toString(36).slice(2, 9), text, done: false }]
      })),
      
      toggleQuickTask: (id) => set((s) => ({
        quickTasks: s.quickTasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
      })),
      
      deleteQuickTask: (id) => set((s) => ({
        quickTasks: s.quickTasks.filter(t => t.id !== id)
      })),
      resetAll: () =>
        set({
          pages: [],
          expanded: {},
          activePageId: null,
          hasSeenWelcome: false,
        }),

      migrateCategoriesToPages: () => {
        const { pages } = get();
        try {
          const raw = localStorage.getItem("myLifeOS.workspace.v1");
          if (!raw) return;
          const parsed = JSON.parse(raw);
          const state = parsed?.state;
          const oldCategories: Category[] = state?.categories ?? [];
          
          if (!isLegacy(pages, oldCategories)) return;

          const catToRootPage: Record<string, PageId> = {};
          const newPages: Page[] = [];

          for (const cat of oldCategories) {
            const rootId = uid("pg");
            catToRootPage[cat.id] = rootId;
            newPages.push({
              id: rootId,
              title: cat.name,
              icon: cat.icon,
              parentId: null,
              createdAt: cat.createdAt,
              updatedAt: Date.now(),
              archived: false,
              content: [],
              migratedFrom: cat.id,
            });
          }

          for (const p of pages) {
            if (p.parentId === null && p.categoryId && catToRootPage[p.categoryId]) {
              newPages.push({
                ...p,
                parentId: catToRootPage[p.categoryId],
                categoryId: undefined,
              });
            } else if (p.parentId !== null) {
              newPages.push({ ...p, categoryId: undefined });
            } else {
              newPages.push(p);
            }
          }

         set({
            pages: newPages,
            expanded: { ...Object.fromEntries(Object.values(catToRootPage).map((id) => [id, true])), pg_quran: true },
          });
            parsed.state.categories = [];
          localStorage.setItem("myLifeOS.workspace.v1", JSON.stringify(parsed));
          
        } catch (e) {
          console.error("Migration failed:", e);
        }
      },
    }),
    {
      name: "myLifeOS.workspace.v1",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.migrateCategoriesToPages();
        }
      },
        skipHydration: true, 
    }
  )
);
function isLegacy(pages: Page[], categories: Category[]): boolean {
  if (categories.length === 0) return false;
  const catIds = new Set(categories.map((c) => c.id));
  return pages.some((p) => p.categoryId && catIds.has(p.categoryId));
}