import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useWorkspace } from "../../store/workspace";

export default function InlineSearch({
  onPick,
}: {
  onPick: (id: string) => void;
}) {
  const pages = useWorkspace((s) => s.pages);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return pages
      .filter((p) => !p.archived && p.title.toLowerCase().includes(q))
      .slice(0, 8);
  }, [pages, query]);

  return (
    <div ref={wrapRef} className="relative mb-3">
      <div
        className={[
          "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg",
          "text-sm text-burgundy-600 dark:text-rose-200",
          "bg-rose-50/60 dark:bg-plum-800/60",
          "border border-rose-200/60 dark:border-plum-600/60",
          "focus-within:ring-2 focus-within:ring-rose-300 dark:focus-within:ring-rose-500/60",
          "transition-colors",
        ].join(" ")}
      >
        <Search className="w-4 h-4 shrink-0 text-burgundy-500 dark:text-rose-300/70" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search…"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-burgundy-400 dark:placeholder:text-rose-300/50"
        />
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full mt-1 z-40 max-h-72 overflow-y-auto rounded-lg border border-rose-200 dark:border-plum-600 bg-white dark:bg-plum-800 shadow-soft-lg">
          {results.length === 0 && (
            <div className="px-3 py-3 text-xs text-center text-burgundy-400 dark:text-rose-300/60">
              No matches
            </div>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onPick(p.id);
                setQuery("");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-burgundy-800 dark:text-rose-100 hover:bg-rose-50 dark:hover:bg-plum-700 transition-colors"
            >
              <span className="text-base">{p.icon}</span>
              <span className="truncate">{p.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}