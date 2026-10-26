import { Sparkles, Plus, X, Heart } from "lucide-react";
import { useWorkspace } from "../../store/workspace";

export default function WelcomePane() {
  const hasSeenWelcome = useWorkspace((s) => s.hasSeenWelcome);
  const markWelcomeSeen = useWorkspace((s) => s.markWelcomeSeen);
  const addRootPage = useWorkspace((s) => s.addRootPage);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-16">
        {/* First-run banner */}
        {!hasSeenWelcome && (
          <div className="relative mb-8 rounded-xl border border-rose-200 dark:border-plum-600 bg-rose-50/70 dark:bg-plum-700/60 px-5 py-4 shadow-soft">
            <button
              onClick={markWelcomeSeen}
              className="absolute top-2 right-2 p-1 rounded hover:bg-rose-200/70 dark:hover:bg-plum-600/70 text-burgundy-500 dark:text-rose-300"
              aria-label="Dismiss welcome"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-burgundy-600 dark:text-rose-300 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-burgundy-800 dark:text-rose-100 mb-1">
                  Welcome to your space 🎀
                </h3>
                <p className="text-sm text-burgundy-600 dark:text-rose-300/80 leading-relaxed">
                  This is your personal life OS. Create pages for the areas
                  of your life (Career, Faith, Health, Growth…), and nest pages
                  inside them. Everything is local — nothing leaves your computer.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main heading */}
        <div className="text-center mb-10">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-burgundy-600 dark:text-rose-300" />
          <h1 className="text-3xl font-serif font-semibold text-burgundy-800 dark:text-rose-100 mb-2">
            My Life OS
          </h1>
          <p className="text-burgundy-500 dark:text-rose-300/80 text-sm leading-relaxed max-w-md mx-auto">
            Your private workspace for everything that matters. Select a page
            from the sidebar to begin, or create something new below.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 gap-3 mb-8 max-w-sm mx-auto">
          <ActionCard
            icon={<Plus className="w-5 h-5" />}
            title="New page"
            description="Create a new blank page to start writing"
            onClick={() => addRootPage({ title: "Untitled", icon: "📄" })}
          />
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-burgundy-400 dark:text-rose-300/50 mt-12">
          Ready to write.
        </p>
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "group flex items-start gap-3 p-4 rounded-xl text-left transition-all",
        "bg-white/70 dark:bg-plum-700/60",
        "border border-rose-200/70 dark:border-plum-600/70",
        "hover:border-burgundy-400 dark:hover:border-rose-400/60",
        "hover:shadow-soft hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div className="p-2 rounded-lg bg-rose-100 dark:bg-plum-600 text-burgundy-700 dark:text-rose-200 group-hover:bg-rose-200 dark:group-hover:bg-plum-500 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-burgundy-800 dark:text-rose-100 mb-0.5">
          {title}
        </div>
        <div className="text-xs text-burgundy-500 dark:text-rose-300/70 leading-snug">
          {description}
        </div>
      </div>
    </button>
  );
}