import { useEffect, useMemo, useState } from "react";
import AppLayout from "./layouts/AppLayout";
import { useWorkspace } from "./store/workspace";
import WelcomePane from "./components/MainPane/WelcomePane";
import PagePane from "./components/MainPane/PagePane";
import HomePane from "./components/MainPane/HomePane";
import SearchDialog from "./components/SearchDialog";
import { Loader2 } from "lucide-react"; // <-- IMPORT LOADER

export default function App() {
  const activePageId = useWorkspace((s) => s.activePageId);
  const pages = useWorkspace((s) => s.pages);
  const setActivePage = useWorkspace((s) => s.setActivePage);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showHome, setShowHome] = useState(true);
  
  // State to track if the store finished loading
  const [isReady, setIsReady] = useState(false);

  // Trigger hydration once on mount
  useEffect(() => {
    useWorkspace.persist.onFinishHydration(() => {
      setIsReady(true);
    });
    useWorkspace.persist.rehydrate();
  }, []);

  const active = useMemo(
    () => pages.find((p) => p.id === activePageId),
    [pages, activePageId]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // Handle navigation events
  useEffect(() => {
    const onHome = () => {
      setActivePage(null);
      setShowHome(true);
     };
    
    window.addEventListener("go-home", onHome);
    return () => window.removeEventListener("go-home", onHome);
  }, [setActivePage]);

  // Hide Home and Settings when a page is selected
  useEffect(() => {
    if (activePageId) {
      setShowHome(false);
     }
  }, [activePageId]);

  // Show a loading screen while the store is reading from disk
  if (!isReady) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-blush-50 dark:bg-plum-800 text-burgundy-600 dark:text-rose-300">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      {active ? (
        <PagePane page={active} />
      ) : showHome ? (
        <HomePane />
      ) : (
        <WelcomePane />
      )}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </AppLayout>
  );
}