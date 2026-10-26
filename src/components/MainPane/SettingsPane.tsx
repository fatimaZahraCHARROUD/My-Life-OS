import { useWorkspace } from "../../store/workspace";
import { Type } from "lucide-react";

export default function SettingsPane() {
  const fontSize = useWorkspace((s) => s.fontSize);
  const setFontSize = useWorkspace((s) => s.setFontSize);

  return (
    <div className="h-full overflow-y-auto">
<div className="max-w-2xl px-10 py-12">
        <h1 className="text-2xl font-serif font-semibold text-burgundy-800 dark:text-rose-100 mb-6">
          Settings
        </h1>

        <section className="mb-8 p-5 rounded-xl bg-white/70 dark:bg-plum-700/60 border border-rose-200/70 dark:border-plum-600/70">
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-burgundy-600 dark:text-rose-300" />
            <h2 className="font-medium text-burgundy-800 dark:text-rose-100">
              Font size
            </h2>
            <span className="ml-auto text-sm font-mono text-burgundy-500 dark:text-rose-300/70">
              {fontSize}px
            </span>
          </div>
          <input
            type="range"
            min={12}
            max={22}
            step={1}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-burgundy-600"
          />
          <p className="text-xs text-burgundy-400 dark:text-rose-300/60 mt-2">
            Applies to the editor and UI text. Changes are saved automatically.
          </p>
        </section>
      </div>
    </div>
  );
}