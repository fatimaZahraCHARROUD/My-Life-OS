import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useWorkspace } from "../store/workspace";

export default function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pages = useWorkspace((s) => s.pages);
  const setActivePage = useWorkspace((s) => s.setActivePage);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return pages
      .filter((p) => !p.archived)
      .filter((p) => {
        if (p.title.toLowerCase().includes(q)) return true;
        try {
          const text = JSON.stringify(p.content ?? []);
          return text.toLowerCase().includes(q);
        } catch {
          return false;
        }
      })
      .slice(0, 20);
  }, [pages, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl bg-white dark:bg-plum-800 border border-rose-200 dark:border-plum-600 shadow-soft-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rose-200 dark:border-plum-600">
          <Search className="w-4 h-4 text-burgundy-500 dark:text-rose-300" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages…"
            className="flex-1 bg-transparent outline-none text-sm text-burgundy-800 dark:text-rose-100 placeholder:text-burgundy-400 dark:placeholder:text-rose-300/50"
          />
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-rose-100 dark:hover:bg-plum-700"
          >
            <X className="w-4 h-4 text-burgundy-500 dark:text-rose-300" />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <div className="px-4 py-6 text-sm text-center text-burgundy-400 dark:text-rose-300/60">
              No results for "{query}"
            </div>
          )}
          {!query.trim() && (
            <div className="px-4 py-6 text-xs text-center text-burgundy-400 dark:text-rose-300/60">
              Type to search across all pages
            </div>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActivePage(p.id);
                onClose();
              }}
              className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-rose-50 dark:hover:bg-plum-700 transition-colors"
            >
              <span className="text-lg">{p.icon}</span>
              <span className="text-sm text-burgundy-800 dark:text-rose-100 truncate">
                {p.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}