import { useEffect, useRef } from "react";
import {
  ExternalLink,
  Pencil,
  Plus,
  Archive,
  Trash2,
} from "lucide-react";

export interface ContextMenuAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface Props {
  x: number;
  y: number;
  onClose: () => void;
  actions: ContextMenuAction[];
}

export default function ContextMenu({ x, y, onClose, actions }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  // Keep menu inside viewport
  const menuW = 200;
  const menuH = actions.length * 34 + 12;
  const clampedX = Math.min(x, window.innerWidth - menuW - 8);
  const clampedY = Math.min(y, window.innerHeight - menuH - 8);

  return (
    <div
      ref={ref}
      className={[
        "fixed z-50 w-[200px] rounded-lg shadow-soft-lg p-1",
        "bg-white dark:bg-plum-700",
        "border border-rose-200 dark:border-plum-600",
      ].join(" ")}
      style={{ left: clampedX, top: clampedY }}
    >
      {actions.map((a, i) => (
        <button
          key={i}
          onClick={() => {
            a.onClick();
            onClose();
          }}
          className={[
            "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm",
            "transition-colors text-left",
            a.danger
              ? "text-burgundy-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40"
              : "text-burgundy-700 dark:text-rose-200 hover:bg-rose-100/70 dark:hover:bg-plum-600",
          ].join(" ")}
        >
          {a.icon}
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}

// Convenience action builders used by NodeRow
export const MenuIcons = {
  open: <ExternalLink className="w-3.5 h-3.5" />,
  rename: <Pencil className="w-3.5 h-3.5" />,
  newChild: <Plus className="w-3.5 h-3.5" />,
  archive: <Archive className="w-3.5 h-3.5" />,
  delete: <Trash2 className="w-3.5 h-3.5" />,
};