import {
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { documentDir, join } from "@tauri-apps/api/path";

const WORKSPACE_ROOT = "MyLifeOS-Workspace";

export async function getWorkspacePath(): Promise<string> {
  const docs = await documentDir();
  return await join(docs, WORKSPACE_ROOT);
}

export async function getPagesDir(): Promise<string> {
  const workspace = await getWorkspacePath();
  return await join(workspace, "pages");
}

export async function getAssetsDir(): Promise<string> {
  const workspace = await getWorkspacePath();
  return await join(workspace, "assets", "images");
}

/** Create workspace folders if they don't exist. */
export async function ensureWorkspace(): Promise<void> {
  const root = await getWorkspacePath();
  const pages = await getPagesDir();
  const assets = await getAssetsDir();

  // Create root
  if (!(await exists(root))) {
    await mkdir(root, { recursive: true });
  }
  
  // Create pages
  if (!(await exists(pages))) {
    await mkdir(pages, { recursive: true });
  }

  // Create assets/images
  if (!(await exists(assets))) {
    await mkdir(assets, { recursive: true });
  }

  // metadata file
  const meta = await join(root, "workspace.json");
  if (!(await exists(meta))) {
    await writeTextFile(
      meta,
      JSON.stringify({ version: 1, createdAt: new Date().toISOString() }, null, 2)
    );
  }
}

export async function readPageFile(id: string): Promise<unknown[] | null> {
  const pages = await getPagesDir();
  const file = await join(pages, `${id}.json`);
  if (!(await exists(file))) return null;
  try {
    const raw = await readTextFile(file);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return null;
  }
}

export async function writePageFile(id: string, content: unknown[]): Promise<void> {
  const pages = await getPagesDir();
  const file = await join(pages, `${id}.json`);
  await writeTextFile(file, JSON.stringify(content, null, 2));
}

export async function deletePageFile(id: string): Promise<void> {
  const pages = await getPagesDir();
  const file = await join(pages, `${id}.json`);
  if (await exists(file)) {
    const { remove } = await import("@tauri-apps/plugin-fs");
    await remove(file);
  }
}

/** Delete an asset from the workspace given its asset URL */
/** Delete an asset from the workspace given its asset URL */
export async function deleteAsset(assetUrl: string): Promise<void> {
  try {
    if (!assetUrl) return;
    
    // 1. Decode the URL (turns %3A into :, %5C into \, etc.)
    let decoded = decodeURIComponent(assetUrl);
    
    // 2. Strip the Tauri protocol prefix to get the raw Windows path
    // (Tauri v2 uses http://asset.localhost/ on Windows)
    let filePath = decoded
      .replace("http://asset.localhost/", "")
      .replace("https://asset.localhost/", "");

    // 3. Clean up forward slashes if needed
    filePath = filePath.replace(/\//g, "\\");

    const { exists, remove } = await import("@tauri-apps/plugin-fs");
    
    if (await exists(filePath)) {
      await remove(filePath);
      console.log("Deleted file:", filePath);
    } else {
      console.warn("File not found for deletion:", filePath);
    }
  } catch (e) {
    console.error("Failed to delete asset:", e);
  }
}