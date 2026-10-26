import { useState, useEffect } from "react";
import { useWorkspace } from "../../store/workspace";
import PageEditor from "../Editor/PageEditor";
import PageHeader from "./PageHeader";
import { Pin, Archive } from "lucide-react";
import type { Page } from "../../types";

export default function PagePane({ page }: { page: Page }) {
  const togglePin = useWorkspace((s) => s.togglePin);
  const archivePage = useWorkspace((s) => s.archivePage);
  const renamePage = useWorkspace((s) => s.renamePage);
  
  const [title, setTitle] = useState(page.title);
  const [openEmoji, setOpenEmoji] = useState(false);

  useEffect(() => { setTitle(page.title); }, [page.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    renamePage(page.id, e.target.value);
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {/* Pass the emoji toggle state to the Header */}
      <PageHeader pageId={page.id} openEmoji={openEmoji} setOpenEmoji={setOpenEmoji} />
      
      <div className="page-content-wrapper w-full px-12 pt-12 pb-8 flex-1">
        
        {/* Title and Actions */}
        <div className="flex items-start gap-3 mb-6 group relative">
          <input
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="flex-1 text-4xl font-serif font-bold text-burgundy-900 dark:text-rose-50 bg-transparent outline-none placeholder:text-burgundy-300 dark:placeholder:text-rose-300/30"
          />
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
            <button
              onClick={() => togglePin(page.id)}
              className={`p-2 rounded-md hover:bg-rose-100 dark:hover:bg-plum-700 ${page.isPinned ? 'text-burgundy-600 dark:text-rose-300' : 'text-burgundy-400 dark:text-rose-300/50'}`}
              title={page.isPinned ? "Unpin page" : "Pin page"}
            >
              <Pin className="w-4 h-4" fill={page.isPinned ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => archivePage(page.id)}
              className="p-2 rounded-md hover:bg-rose-100 dark:hover:bg-plum-700 text-burgundy-400 dark:text-rose-300/50"
              title="Archive page"
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
        </div>

        <PageEditor key={page.id} pageId={page.id} />
      </div>
    </div>
  );
}