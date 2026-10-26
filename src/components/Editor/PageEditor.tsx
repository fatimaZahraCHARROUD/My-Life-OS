import { useMemo, useEffect, useState, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import { useWorkspace } from "../../store/workspace";
import { useDebouncedSave, type SaveStatus } from "../../hooks/useDebouncedSave";
import { Check, Loader2, AlertCircle, FileDown, Image as ImageIcon, Link, MessageSquare } from "lucide-react";import { BlockNoteSchema, combineByGroup, filterSuggestionItems, defaultBlockSpecs } from "@blocknote/core";
import { getDefaultReactSlashMenuItems, SuggestionMenuController } from "@blocknote/react";
import {
  getMultiColumnSlashMenuItems,
  multiColumnDropCursor,
  locales as multiColumnLocales,
  withMultiColumn,
} from "@blocknote/xl-multi-column";
import { exportPageToPdf } from "../../lib/exportPdf";
import * as locales from "@blocknote/core/locales";
import { readPageFile, writePageFile, getAssetsDir, deleteAsset } from "../../lib/workspace";
import { pickAndStoreImage } from "../../lib/uploadImage";
import { join } from "@tauri-apps/api/path";
import { CalloutBlock, PageLinkBlock } from "../../editor/customBlocks";
 
export default function PageEditor({ pageId }: { pageId: string }) {
  const [exporting, setExporting] = useState(false);
  const [loadedContent, setLoadedContent] = useState<unknown[] | null>(null);
  const pages = useWorkspace((s) => s.pages);
  const setPageContent = useWorkspace((s) => s.setPageContent);

  const page = useMemo(
    () => pages.find((p) => p.id === pageId),
    [pages, pageId]
  );

  useEffect(() => {
    let cancelled = false;
    setLoadedContent(null);
    (async () => {
      const disk = await readPageFile(pageId);
      if (cancelled) return;
      if (disk && disk.length > 0) {
        setLoadedContent(disk);
      } else if (page && Array.isArray(page.content) && page.content.length > 0) {
        setLoadedContent(page.content);
      } else {
        setLoadedContent([]);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  if (loadedContent === null) {
    return (
      <div className="p-6 text-sm text-burgundy-400 dark:text-rose-300/60">
        Loading…
      </div>
    );
  }

  return (
    <EditorInner
      pageId={pageId}
      title={page?.title ?? "Untitled"}
      initialContent={loadedContent}
      setPageContent={setPageContent}
      exporting={exporting}
      setExporting={setExporting}
    />
  );
}

function EditorInner({
  pageId,
  title,
  initialContent,
  setPageContent,
  exporting,
  setExporting,
}: {
  pageId: string;
  title: string;
  initialContent: unknown[];
  setPageContent: (id: string, content: unknown[]) => void;
  exporting: boolean;
  setExporting: (v: boolean) => void;
}) {
  
  const schema = withMultiColumn(
    BlockNoteSchema.create({
      blockSpecs: {
        ...defaultBlockSpecs,
        callout: CalloutBlock(),
        pageLink: PageLinkBlock(),
      },
    })
  );

  const editor = useCreateBlockNote({
    initialContent: initialContent.length > 0 ? (initialContent as any[]) : undefined,
    animations: false,
    schema,
    dropCursor: multiColumnDropCursor,
    dictionary: { ...locales.en, multi_column: multiColumnLocales.en },
    sideMenu: { hoverMargin: 20, dropMargin: 400 },
    uploadFile: async (file: File) => {
      const assetsDir = await getAssetsDir();
      const { exists, mkdir } = await import("@tauri-apps/plugin-fs");
      if (!(await exists(assetsDir))) await mkdir(assetsDir, { recursive: true });

      const ext = file.name.split(".").pop() ?? "png";
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const destPath = await join(assetsDir, name);
      
      const { writeFile } = await import("@tauri-apps/plugin-fs");
      const buffer = await file.arrayBuffer();
      await writeFile(destPath, new Uint8Array(buffer));
      
      const { convertFileSrc } = await import("@tauri-apps/api/core");
      return convertFileSrc(destPath);
    },
  });

  const [docJson, setDocJson] = useState<unknown[]>(editor.document);
  const [readyToSave, setReadyToSave] = useState(false);

  // 1. KEEP TRACK OF ORIGINAL IMAGES HERE
  const initialImagesRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const urls = new Set<string>();
    const extract = (blocks: any[]) => {
      for (const b of blocks) {
        if (b.type === "image" && b.props?.url) urls.add(b.props.url);
        if (b.children?.length) extract(b.children);
      }
    };
    extract(initialContent);
    initialImagesRef.current = urls;
  }, [initialContent]);

  useEffect(() => {
    const t = setTimeout(() => setReadyToSave(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const unsub = editor.onChange(() => {
      setDocJson(editor.document);
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [editor]);

  // 2. THE SAVE LOGIC WITH IMAGE DELETION
  const status: SaveStatus = useDebouncedSave(
    docJson,
    async (content) => {
      if (!readyToSave) return;

      const currentImages = new Set<string>();
      const extractUrls = (blocks: any[]) => {
        for (const block of blocks) {
          if (block.type === "image" && block.props?.url) currentImages.add(block.props.url);
          if (block.children?.length) extractUrls(block.children);
        }
      };
      extractUrls(content as any[]);

      // Delete images that were present originally but are now gone
      for (const oldUrl of initialImagesRef.current) {
        if (!currentImages.has(oldUrl)) {
          await deleteAsset(oldUrl);
        }
      }
      
      // Update the ref for next time
      initialImagesRef.current = currentImages;

      setPageContent(pageId, content);
      await writePageFile(pageId, content);
    },
    800
  );

  const handleExport = async () => {
    setExporting(true);
    const res = await exportPageToPdf(editor, title);
    setExporting(false);
    if (res.ok) alert(`Saved to:\n${res.path}`);
    else if (res.error !== "cancelled") alert(`Export failed: ${res.error}`);
  };

  const handleInsertImage = async () => {
    const url = await pickAndStoreImage();
    if (!url) return;
    const pos = editor.getTextCursorPosition();
    editor.insertBlocks(
      [{ type: "image", props: { url } } as any],
      pos.block,
      "after"
    );
  };

   const getSlashMenuItems = useMemo(() => {
    return async (query: string) => {
      const customItems = [
        {
          title: "Link to Page",
          onItemClick: () => {
            (editor as any).insertBlocks(
              [{ type: "pageLink" }],
              editor.getTextCursorPosition().block,
              "after"
            );
          },
          aliases: ["page", "link"],
          group: "Advanced",
          icon: <Link className="w-4 h-4" />, // <-- ADDED ICON HERE
        },
        {
          title: "Callout Box",
          onItemClick: () => {
            (editor as any).insertBlocks(
              [{ type: "callout" }],
              editor.getTextCursorPosition().block,
              "after"
            );
          },
          aliases: ["box", "alert", "note", "callout"],
          group: "Advanced",
          icon: <MessageSquare className="w-4 h-4" />, // <-- ADDED ICON HERE
        },
      ];

      const allItems = combineByGroup(
        getDefaultReactSlashMenuItems(editor),
        getMultiColumnSlashMenuItems(editor),
        customItems as any
      );

      const filtered = filterSuggestionItems(allItems, query);

      return filtered.filter(
        (item) =>
          !item.title?.toLowerCase().includes("video") &&
          !item.title?.toLowerCase().includes("audio")
      );
    };
  }, [editor]);

  return (
    <div className="relative">
      <SaveIndicator status={status} />
      <div className="flex items-center justify-end mb-2 gap-2">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-ghost flex items-center gap-1.5 text-xs"
        >
          <FileDown className="w-3.5 h-3.5" />
          {exporting ? "Exporting…" : "Export PDF"}
        </button>
        <button
          onClick={handleInsertImage}
          className="btn-ghost flex items-center gap-1.5 text-xs"
          title="Insert image from computer"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Insert Image
        </button>
      </div>
      <div className="bn-container my-life-os-editor">
      <BlockNoteView 
  editor={editor} 
  theme={{
    colors: {
      highlights: {
        pink: { text: "#8B4557", background: "#FFF0F5" },
        red: { text: "#4A1B2C", background: "#FFD1DC" },
        yellow: { text: "#7B2D3F", background: "#FDF2F5" },
        blue: { text: "#FFF9FA", background: "#E8A5B8" },
        green: { text: "#FFF9FA", background: "#7B2D3F" },
        gray: { text: "#2F101D", background: "#F5D2DB" },
      }
    }
  }}
  slashMenu={false}
>
  <SuggestionMenuController triggerCharacter={"/"} getItems={getSlashMenuItems} />
</BlockNoteView>
      </div>
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 dark:bg-plum-700/90 border border-rose-200 dark:border-plum-600 shadow-soft text-burgundy-700 dark:text-rose-200">
      {status === "saving" && (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Saving…</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Saved</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="w-3 h-3 text-red-600" />
          <span>Save failed</span>
        </>
      )}
    </div>
  );
}