import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import { ExternalLink } from "lucide-react";
import { useWorkspace } from "../store/workspace";
import { useState } from "react";

// 1. Custom Callout Box (MULTI-LINE)
export const CalloutBlock = createReactBlockSpec(
  {
    type: "callout",
    propSchema: {
      ...defaultProps,
      // These are the soft colors you asked for
      backgroundColor: { default: "#FFF0F5" }, // Soft Baby Pink
      borderColor: { default: "#FFB6C1" },     // Light Rose
      textColor: { default: "#8B4557" },       // Soft Plum Text
    },
    content: "none",
    layoutOnly: true,
  },
  {
    renderFrame: (props) => (
      <div
        className="w-full p-5 rounded-lg my-3"
        style={{
          backgroundColor: props.block.props.backgroundColor,
          border: `2px solid ${props.block.props.borderColor}`,
          color: props.block.props.textColor,
        }}
      >
        <div ref={props.slotRef} className="outline-none callout-inner-text" />
      </div>
    ),
  }
);

// 2. Link to Page
export const PageLinkBlock = createReactBlockSpec(
  {
    type: "pageLink",
    propSchema: { pageId: { default: "" } },
    content: "none",
  },
  {
    render: (props) => {
      const pages = useWorkspace((s) => s.pages);
      const setActivePage = useWorkspace((s) => s.setActivePage);
      const addPage = useWorkspace((s) => s.addPage);
      const activePageId = useWorkspace((s) => s.activePageId);
      const [editing, setEditing] = useState(!props.block.props.pageId);
      
      const target = pages.find((p) => p.id === props.block.props.pageId);

      if (editing) {
        return (
          <select
            className="p-2 rounded border border-rose-300 bg-white text-sm w-full max-w-xs outline-none"
            onChange={(e) => {
              const val = e.target.value;
              
              // If they clicked "Create new page"
              if (val === "NEW_PAGE") {
                // Create the page inside the currently open page
                const newPageId = addPage({
                  title: "Untitled",
                  parentId: activePageId, 
                });
                // Update the block to point to the new page
                props.editor.updateBlock(props.block, { props: { pageId: newPageId } });
                setEditing(false);
                
                // Navigate to the new page so they can edit the title/icon
                setTimeout(() => setActivePage(newPageId), 50);
              } else {
                props.editor.updateBlock(props.block, { props: { pageId: val } });
                setEditing(false);
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>Select a page...</option>
            
            {/* ADDED: The create new page option */}
            <option value="NEW_PAGE" className="font-bold text-burgundy-600">
              ➕ Create new sub-page
            </option>
            
            <option value="" disabled>──────────</option>

            {pages.filter(p => !p.archived).map(p => (
              <option key={p.id} value={p.id}>{p.icon || "📄"} {p.title}</option>
            ))}
          </select>
        );
      }

      return (
        <button
          onClick={() => setActivePage(target?.id || "")}
          onDoubleClick={() => setEditing(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-rose-50 hover:bg-rose-100 border border-rose-200 text-sm font-medium text-burgundy-700 my-1"
          title="Double-click to change link"
        >
          <span>{target?.icon || "📄"}</span>
          <span>{target?.title || "Unknown Page"}</span>
          <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
        </button>
      );
    },
  }
);