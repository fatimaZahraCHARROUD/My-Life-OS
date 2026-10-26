import { useMemo, useState } from "react";
import { Plus, Clock, CheckCircle2, Circle, Trash2, FileText } from "lucide-react";
import { useWorkspace } from "../../store/workspace";
type QuickTask = { id: string; text: string; done: boolean };

export default function HomePane() {
  const pages = useWorkspace((s) => s.pages);
  const setActivePage = useWorkspace((s) => s.setActivePage);
  const addRootPage = useWorkspace((s) => s.addRootPage);
  
  const quickTasks = useWorkspace((s) => s.quickTasks);
  const addQuickTask = useWorkspace((s) => s.addQuickTask);
  const toggleQuickTask = useWorkspace((s) => s.toggleQuickTask);
  const deleteQuickTask = useWorkspace((s) => s.deleteQuickTask);
  
  const [newTask, setNewTask] = useState("");

  const recent = useMemo(
    () => [...pages].filter((p) => !p.archived).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8),
    [pages]
  );

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addQuickTask(newTask.trim());
    setNewTask("");
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-10 py-12">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-burgundy-800 dark:text-rose-100 mb-1">Home</h1>
            <p className="text-sm text-burgundy-500 dark:text-rose-300/70">Your workspace at a glance</p>
          </div>
          <button onClick={() => addRootPage({ title: "Untitled" })} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New page
          </button>
        </div>

        {/* QUICK TASKS WIDGET */}
        <section className="mb-10 p-5 rounded-xl bg-white/70 dark:bg-plum-700/60 border border-rose-200/70 dark:border-plum-600/70 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-burgundy-700 dark:text-rose-200 mb-4">
            <CheckCircle2 className="w-4 h-4" /> Quick Tasks
          </h2>
          
          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a quick task..."
              className="flex-1 bg-white dark:bg-plum-800 border border-rose-200 dark:border-plum-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-300"
            />
            <button type="submit" className="btn-primary px-3 py-2">
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-2">
            {quickTasks.length === 0 && (
              <p className="text-xs text-burgundy-400 text-center italic py-2">No tasks yet. Add one above!</p>
            )}
            {quickTasks.map((task: QuickTask) => (
              <div key={task.id} className="flex items-center gap-3 group">
                <button onClick={() => toggleQuickTask(task.id)} className="text-burgundy-400 hover:text-burgundy-600">
                  {task.done ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
                </button>
                <span className={`flex-1 text-sm ${task.done ? "line-through text-burgundy-400 opacity-60" : "text-burgundy-800 dark:text-rose-100"}`}>
                  {task.text}
                </span>
                <button onClick={() => deleteQuickTask(task.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* RECENT PAGES (LIST STYLE) */}
        <section>
          <h2 className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-burgundy-500 dark:text-rose-300/70 mb-3">
            <Clock className="w-3.5 h-3.5" /> Recently edited
          </h2>
          
          <div className="bg-white/70 dark:bg-plum-700/60 rounded-xl border border-rose-200/70 dark:border-plum-600/70 overflow-hidden shadow-sm">
            {recent.length === 0 ? (
              <div className="p-6 text-center text-sm text-burgundy-400 dark:text-rose-300/60">
                No pages yet.
              </div>
            ) : (
              recent.map((p, index) => (
                <button
                  key={p.id}
                  onClick={() => setActivePage(p.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-rose-50 dark:hover:bg-plum-600/50 transition-colors ${
                    index !== recent.length - 1 ? 'border-b border-rose-100 dark:border-plum-600/50' : ''
                  }`}
                >
                  <span className="text-xl">{p.icon || <FileText className="w-5 h-5 text-burgundy-400" />}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-burgundy-800 dark:text-rose-100 truncate">{p.title}</div>
                  </div>
                  <div className="text-xs text-burgundy-400 dark:text-rose-300/60 whitespace-nowrap">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}