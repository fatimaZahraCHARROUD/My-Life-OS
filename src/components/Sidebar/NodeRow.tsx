import { useEffect, useRef, useState } from "react";
import { ChevronRight, Plus, Pencil, Trash2, Archive } from "lucide-react";
import ContextMenu, { MenuIcons } from "./ContextMenu";
import { confirm } from "@tauri-apps/plugin-dialog";

export interface NodeRowProps {
  icon?: string;
  label: string;
  level: number;
  hasChildren: boolean;
  expanded: boolean;
  active?: boolean;
  collapsed: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  onAddChild?: () => void;
  onRename?: (newName: string) => void;
  onDelete?: () => void;
  onArchive?: () => void;
  renameDisabled?: boolean;
  onActivate?: () => void;
}

export default function NodeRow({
  icon,
  label,
  level,
  hasChildren,
  expanded,
  active,
  collapsed,
  onToggle,
  onClick,
  onAddChild,
  onRename,
  onDelete,
  onArchive,
  renameDisabled,
  onActivate,
}: NodeRowProps) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (renaming) {
      setDraft(label);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [renaming, label]);

  const commit = () => {
    if (!renaming) return;
    setRenaming(false);
    if (onRename && draft.trim() && draft.trim() !== label)
      onRename(draft.trim());
  };
  const cancel = () => {
    setRenaming(false);
    setDraft(label);
  };

  const indent = collapsed ? 0 : level * 12;

  const menuActions = [
    onActivate && { label: "Open", icon: MenuIcons.open, onClick: onActivate },
    onRename &&
      !renameDisabled && {
        label: "Rename",
        icon: MenuIcons.rename,
        onClick: () => setRenaming(true),
      },
    onAddChild && {
      label: "New child page",
      icon: MenuIcons.newChild,
      onClick: onAddChild,
    },
    onArchive && {
      label: "Archive",
      icon: MenuIcons.archive,
      onClick: onArchive,
    },
    onDelete && {
      label: "Delete",
      icon: MenuIcons.delete,
      onClick: onDelete,
      danger: true,
    },
  ].filter(Boolean) as {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
  }[];

  return (
    <>
      <div
        tabIndex={0}
        className={[
          "group flex items-center gap-1 rounded-md text-sm select-none",
          "outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:focus-visible:ring-rose-500/60",
          "transition-colors",
          active
            ? "bg-rose-100 text-burgundy-800 dark:bg-plum-700 dark:text-rose-100"
            : "text-burgundy-700 dark:text-rose-200 hover:bg-rose-100/60 dark:hover:bg-plum-700/60",
        ].join(" ")}
        style={{ paddingLeft: indent }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (menuActions.length) setMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        {!collapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
            className="p-0.5 rounded hover:bg-rose-200/60 dark:hover:bg-plum-600/60 shrink-0"
            aria-label={expanded ? "Collapse" : "Expand"}
            style={{ visibility: hasChildren ? "visible" : "hidden" }}
            tabIndex={-1}
          >
            <ChevronRight
              className={[
                "w-3.5 h-3.5 transition-transform",
                expanded ? "rotate-90" : "",
              ].join(" ")}
            />
          </button>
        )}

{!collapsed && icon && <span className="text-base shrink-0">{icon}</span>}
        <div
          className={[
            "flex-1 min-w-0 cursor-pointer py-1.5",
            collapsed ? "flex items-center justify-center" : "truncate",
          ].join(" ")}
          onClick={() => {
            if (renaming) return;
            (onActivate ?? onClick)?.();
          }}
          onDoubleClick={() => {
            if (!renameDisabled && onRename) setRenaming(true);
          }}
          title={label}
        >
          {renaming ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancel();
                }
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white dark:bg-plum-700 border border-rose-300 dark:border-plum-500 rounded px-1 py-0.5 text-sm outline-none focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-500/60"
            />
          ) : collapsed ? (
            <span className="text-base" title={label}>
              {icon}
            </span>
          ) : (
            <span className="truncate block">{label}</span>
          )}
        </div>

        {!collapsed && hovered && !renaming && (
          <div className="flex items-center gap-0.5 pr-1">
            {onAddChild && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild();
                }}
                className="p-1 rounded hover:bg-rose-200/70 dark:hover:bg-plum-600/70"
                title="Add child page"
                tabIndex={-1}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            {onRename && !renameDisabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRenaming(true);
                }}
                className="p-1 rounded hover:bg-rose-200/70 dark:hover:bg-plum-600/70"
                title="Rename"
                tabIndex={-1}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                }}
                className="p-1 rounded hover:bg-rose-200/70 dark:hover:bg-plum-600/70"
                title="Archive"
                tabIndex={-1}
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )}
{onDelete && (
  <button
    onClick={async (e) => {
      e.stopPropagation();
      // Use Tauri's native dialog
      const yes = await confirm(`Delete "${label}"? This cannot be undone.`, {
        title: "Delete Page",
        kind: "warning",
      });
      if (yes) {
        onDelete();
      }
    }}
    className="p-1 rounded hover:bg-rose-200/70 dark:hover:bg-plum-600/70"
    title="Delete"
    tabIndex={-1}
  >
    <Trash2 className="w-3.5 h-3.5" />
  </button>
)}
          </div>
        )}
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          actions={menuActions}
        />
      )}
    </>
  );
}