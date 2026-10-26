import { useWorkspace } from "../../store/workspace";
import type { Page } from "../../types";
import NodeRow from "./NodeRow";

interface PageNodeProps {
  page: Page;
  level: number;
  collapsed: boolean;
  onDragStart?: (id: string) => void;
  onDropOn?: (dragId: string, targetId: string, position: "inside" | "before" | "after") => void;
  draggingId?: string | null;
}

export default function PageNode({
  page,
  level,
  collapsed,
  onDragStart,
  onDropOn,
  draggingId,
}: PageNodeProps) {
  const expanded = useWorkspace((s) => s.expanded[page.id] ?? false);
  const toggleExpanded = useWorkspace((s) => s.toggleExpanded);
  const setActivePage = useWorkspace((s) => s.setActivePage);
  const activePageId = useWorkspace((s) => s.activePageId);
  const pages = useWorkspace((s) => s.pages);
  const addPage = useWorkspace((s) => s.addPage);
  const renamePage = useWorkspace((s) => s.renamePage);
  const deletePage = useWorkspace((s) => s.deletePage);
  const archivePage = useWorkspace((s) => s.archivePage);

  // Removed categoryId check
  const children = pages
    .filter((p) => !p.archived && p.parentId === page.id)
    .sort((a, b) => a.title.localeCompare(b.title));
  const hasChildren = children.length > 0;

  return (
    <>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/page-id", page.id);
          onDragStart?.(page.id);
        }}
        onDragOver={(e) => {
          if (draggingId && draggingId !== page.id) e.preventDefault();
        }}
        onDrop={(e) => {
          const dragId = e.dataTransfer.getData("text/page-id");
          if (!dragId || dragId === page.id) return;
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const y = e.clientY - rect.top;
          const third = rect.height / 3;
          const position =
            y < third ? "before" : y > rect.height - third ? "after" : "inside";
          onDropOn?.(dragId, page.id, position);
        }}
      >
        <NodeRow
          icon={page.icon} 
          label={page.title}
          level={level}
          hasChildren={hasChildren}
          expanded={expanded}
          active={activePageId === page.id}
          collapsed={collapsed}
          onToggle={() => toggleExpanded(page.id)}
          onClick={() => setActivePage(page.id)}
          onActivate={() => setActivePage(page.id)}
          onAddChild={() =>
            addPage({
              title: "Untitled",
               parentId: page.id,
              // categoryId removed!
            })
          }
          onRename={(newName) => renamePage(page.id, newName)}
          onDelete={() => deletePage(page.id)}
          onArchive={() => archivePage(page.id)}
        />
      </div>
      {expanded &&
        children.map((child) => (
          <PageNode
            key={child.id}
            page={child}
            level={level + 1}
            collapsed={collapsed}
            onDragStart={onDragStart}
            onDropOn={onDropOn}
            draggingId={draggingId}
          />
        ))}
    </>
  );
}