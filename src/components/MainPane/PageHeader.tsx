import { Image as ImageIcon, X, MoveVertical } from "lucide-react";
import { useWorkspace } from "../../store/workspace";
import { useState, useRef, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getAssetsDir, deleteAsset } from "../../lib/workspace";
import EmojiPicker, { Theme } from "emoji-picker-react";
 
export default function PageHeader({
  pageId,
  openEmoji,
  setOpenEmoji,
}: {
  pageId: string;
  openEmoji: boolean;
  setOpenEmoji: (val: boolean) => void;
}) {
  const pages = useWorkspace((s) => s.pages);
  const setPageCover = useWorkspace((s) => s.setPageCover);
  const setPageIcon = useWorkspace((s) => s.setPageIcon);
  const setCoverPositionY = useWorkspace((s) => s.setCoverPositionY);
  const page = pages.find((p) => p.id === pageId);
  
  const [hoverCover, setHoverCover] = useState(false);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);
  
  const startYRef = useRef(0);
  const startPosRef = useRef(50);
  const [isDragging, setIsDragging] = useState(false);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setOpenEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [setOpenEmoji]);

  if (!page) return null;

   const handleAddCover = async () => {
    // 1. Delete old cover if it exists
    if (page.coverUrl) {
      await deleteAsset(page.coverUrl);
    }

    const picked = await open({
      title: "Choose a cover image",
      multiple: false,
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }],
    });
    
    if (picked && typeof picked === "string") {
      const assetsDir = await getAssetsDir();
      const { exists, mkdir, copyFile } = await import("@tauri-apps/plugin-fs");
      if (!(await exists(assetsDir))) await mkdir(assetsDir, { recursive: true });

      const ext = picked.split(".").pop() ?? "png";
      const name = `cover-${Date.now()}.${ext}`;
      const destPath = await join(assetsDir, name);
      
      await copyFile(picked, destPath);
      setPageCover(pageId, convertFileSrc(destPath));
      setCoverPositionY(pageId, 50);
    }
  };

  // --- Drag Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isRepositioning) return;
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startPosRef.current = page.coverPositionY ?? 50;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isRepositioning || !isDragging) return;
    const deltaY = e.clientY - startYRef.current;
    const newPos = Math.min(100, Math.max(0, startPosRef.current - deltaY * 0.2));
    setCoverPositionY(pageId, newPos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full group">
      {/* BANNER HEIGHT: Change `h-64` to adjust height */}
      <div 
        className={`h-64 w-full bg-rose-100 dark:bg-plum-700 relative flex items-center justify-center transition-all ${
          isRepositioning 
            ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') 
            : ''
        }`}
        onMouseEnter={() => setHoverCover(true)}
        onMouseLeave={() => {
          setHoverCover(false);
          setIsDragging(false);
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {page.coverUrl ? (
          <>
            <img 
              src={page.coverUrl} 
              alt="Cover" 
              className="w-full h-full object-cover select-none pointer-events-none"
              style={{ objectPosition: `50% ${page.coverPositionY ?? 50}%` }} 
            />
            
            {/* Hover actions for existing cover */}
            {hoverCover && !isRepositioning && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsRepositioning(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white rounded-md text-xs transition-colors"
                >
                  <MoveVertical className="w-3.5 h-3.5" /> Reposition
                </button>
                <button
                  onClick={handleAddCover}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white rounded-md text-xs transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Change cover
                </button>
                               <button
                  onClick={async () => { 
                    if (page.coverUrl) await deleteAsset(page.coverUrl);
                    setPageCover(pageId, undefined); 
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-red-500 text-white rounded-md text-xs transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            )}
            
            {/* Overlay when repositioning */}
            {isRepositioning && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span className="bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-medium pointer-events-none">
                  Drag image up/down
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsRepositioning(false); }}
                  className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-200 shadow-md"
                >
                  Done
                </button>
              </div>
            )}
          </>
        ) : (
          hoverCover && (
            <button
              onClick={handleAddCover}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-plum-800/80 rounded-md text-sm text-burgundy-600 dark:text-rose-300 shadow-sm hover:bg-white transition-all z-10"
            >
              <ImageIcon className="w-4 h-4" /> Add cover
            </button>
          )
        )}
      </div>

      {/* FLOATING ICON */}
      <div className="absolute -bottom-10 left-12 z-10" ref={emojiRef}>
        {page.icon ? (
          <button 
            onClick={() => setOpenEmoji(!openEmoji)}
            className="text-7xl hover:opacity-80 transition-opacity drop-shadow-md"
            title="Change Icon"
          >
            {page.icon}
          </button>
        ) : (
          <button
            onClick={() => setOpenEmoji(!openEmoji)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-plum-800 rounded-lg shadow-md border border-rose-200 dark:border-plum-600 text-burgundy-500 dark:text-rose-300/70 hover:bg-rose-50 dark:hover:bg-plum-700 transition-colors"
          >
            <span className="text-xl">+</span> Add icon
          </button>
        )}

        {/* Emoji Picker attached to the big icon */}
        {openEmoji && (
          <div className="absolute top-full left-0 mt-2 shadow-2xl rounded-xl border border-rose-200 dark:border-plum-600">
            <EmojiPicker 
              theme={document.documentElement.classList.contains("dark") ? Theme.DARK : Theme.LIGHT}
              onEmojiClick={(emojiData) => {
                setPageIcon(page.id, emojiData.emoji);
                setOpenEmoji(false);
              }}
              width={320}
              height={400}
            />
            {page.icon && (
              <div className="p-2 bg-white dark:bg-plum-800 rounded-b-xl border-t border-rose-200 dark:border-plum-600">
                <button
                  onClick={() => { setPageIcon(page.id, ""); setOpenEmoji(false); }}
                  className="w-full text-xs text-red-500 hover:bg-rose-100 dark:hover:bg-plum-700 p-1.5 rounded transition-colors"
                >
                  Remove icon
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}