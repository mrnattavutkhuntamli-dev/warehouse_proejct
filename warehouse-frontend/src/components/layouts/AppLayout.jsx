import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import useUiStore from "@/store/uiStore";
import { cn } from "@/utils/cn";

export function AppLayout() {
  const { mobileSidebarOpen, closeMobileSidebar } = useUiStore();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={closeMobileSidebar}
          />
          {/* Drawer */}
          <div className="fixed left-0 top-0 z-50 h-full md:hidden animate-fade-in">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-6 max-w-[1600px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
