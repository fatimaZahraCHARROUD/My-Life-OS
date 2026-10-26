import Sidebar from "../components/Sidebar/Sidebar";
import TopBar from "../components/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white dark:bg-plum-800">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}