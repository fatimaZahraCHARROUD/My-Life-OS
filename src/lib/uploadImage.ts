import { open } from "@tauri-apps/plugin-dialog";
import { copyFile } from "@tauri-apps/plugin-fs";
import { convertFileSrc } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { getAssetsDir } from "./workspace";

export async function pickAndStoreImage(): Promise<string | null> {
  const picked = await open({
    title: "Choose an image",
    multiple: false,
    filters: [
      {
        name: "Images",
        extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
      },
    ],
  });
  if (!picked || typeof picked !== "string") return null;

  const ext = picked.split(".").pop() ?? "png";
  const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const name = `${id}.${ext}`;
  const dir = await getAssetsDir();
  const dest = await join(dir, name);

  await copyFile(picked, dest);

  // Convert to a URL the webview can render (asset protocol)
  return convertFileSrc(dest);
}