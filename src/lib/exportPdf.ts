import { PDFExporter, typstDefaultSchemaMappings } from "@blocknote/xl-pdf-exporter";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { BlockNoteSchema } from "@blocknote/core";

export async function exportPageToPdf(
  editor: any,
  title: string
): Promise<{ ok: boolean; path?: string; error?: string }> {
  try {
    const path = await save({
      title: "Save page as PDF",
      defaultPath: `${title.replace(/[^\w\u4e00-\u9fa5-]/g, "_")}.pdf`,
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });
    if (!path) return { ok: false, error: "cancelled" };

    // ✅ Use the default schema for export, to match typstDefaultSchemaMappings
    const defaultSchema = BlockNoteSchema.create();
    const exporter = new PDFExporter(defaultSchema, typstDefaultSchemaMappings);
    const result = await exporter.toPDF(editor.document, {
      title,
      lang: "en",
    });

    if (result.error) {
      return { ok: false, error: result.error };
    }

    const buffer = await result.blob.arrayBuffer();
    await writeFile(path, new Uint8Array(buffer));

    return { ok: true, path };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}