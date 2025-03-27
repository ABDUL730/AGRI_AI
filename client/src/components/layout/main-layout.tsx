import { useState } from "react";
import Sidebar from "@/components/ui/sidebar";
import MobileNav from "@/components/ui/mobile-nav";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSelector } from "@/components/ui/language-selector";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Sidebar for mobile (when open) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar}></div>
          <Sidebar className="relative" />
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center md:hidden">
                <button
                  type="button"
                  className="p-2 rounded-md text-gray-700 focus:outline-none"
                  onClick={toggleSidebar}
                >
                  <span className="material-icons">menu</span>
                </button>
                <div className="ml-3 flex items-center">
                  <span className="material-icons text-primary">eco</span>
                  <h1 className="text-lg font-heading font-bold text-primary">AgriAI</h1>
                </div>
              </div>
              
              {/* Search bar */}
              <div className="max-w-lg w-full hidden md:block">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-icons text-gray-400">search</span>
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
                    placeholder={t("Search for crops, schemes, or weather")}
                    type="search"
                  />
                </div>
              </div>
              
              {/* Right side icons */}
              <div className="flex items-center space-x-4">
                {/* Notification bell */}
                <button type="button" className="relative p-1 text-gray-700 hover:text-primary focus:outline-none">
                  <span className="material-icons">notifications</span>
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white font-semibold">3</span>
                </button>
                
                {/* Language selector */}
                <LanguageSelector />
                
                {/* Help */}
                <button type="button" className="p-1 text-gray-700 hover:text-primary focus:outline-none">
                  <span className="material-icons">help_outline</span>
                </button>
                
                {/* User menu (mobile only) */}
                <button type="button" className="md:hidden p-1 text-gray-700 hover:text-primary focus:outline-none">
                  <span className="material-icons">account_circle</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8 pb-16 md:pb-8">
          {children}
        </main>
      </div>
      
      {/* Mobile navigation footer */}
      <MobileNav />
    </div>
  );
}

export default MainLayout;
