import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";

interface NavigationItem {
  path: string;
  icon: string;
  label: string;
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, isLoading } = useAuth();

  const navigationItems: NavigationItem[] = [
    { path: "/", icon: "dashboard", label: t("Dashboard") },
    { path: "/crop-management", icon: "grass", label: t("Crop Management") },
    { path: "/irrigation", icon: "water_drop", label: t("Irrigation") },
    { path: "/loans", icon: "paid", label: t("Loans & Subsidies") },
    { path: "/market", icon: "shopping_cart", label: t("Market Connect") },
    { path: "/assistant", icon: "forum", label: t("AI Assistant") },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    // Type safety - cast as any since we know these values align with our Language type
    setLanguage(value as any);
  };

  return (
    <aside className={`hidden md:flex md:flex-shrink-0 ${className}`}>
      <div className="flex flex-col w-64 bg-primary text-white">
        <div className="flex items-center justify-center h-16 px-4 border-b border-primary-dark">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-2xl">eco</span>
            <h1 className="text-xl font-heading font-bold">AgriAI</h1>
          </div>
        </div>
        
        <div className="flex flex-col flex-grow px-4 pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 space-y-2">
            {navigationItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center px-2 py-3 text-white ${
                  location === item.path ? 'bg-primary-dark' : 'hover:bg-primary-dark'
                } rounded-md group`}
              >
                <span className="material-icons mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="pt-4 mt-6 border-t border-primary-dark">
            <div className="flex items-center px-4 py-2 text-sm">
              <span className="material-icons mr-2 text-sm">language</span>
              <select 
                className="bg-primary text-white outline-none cursor-pointer"
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="english">English</option>
                <option value="hindi">हिन्दी (Hindi)</option>
                <option value="tamil">தமிழ் (Tamil)</option>
                <option value="telugu">తెలుగు (Telugu)</option>
                <option value="kannada">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>
            
            <div className="flex items-center px-4 py-3 mt-2 text-sm rounded-md bg-primary-light">
              <span className="material-icons mr-2 text-sm">wifi_off</span>
              <span>{t("Offline Mode Available")}</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-primary-dark">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center text-primary">
              <span className="material-icons text-sm">person</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.fullName || '...'}</p>
              <p className="text-xs">{user?.location || '...'}</p>
            </div>
            <button 
              type="button" 
              className="ml-auto hover:bg-primary-dark p-1.5 rounded-full transition-colors" 
              onClick={logout}
              disabled={isLoading}
              aria-label={t("Logout")}
              title={t("Logout")}
            >
              <span className="material-icons">logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
