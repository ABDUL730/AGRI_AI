import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface TopNavProps {
  className?: string;
}

export function TopNav({ className }: TopNavProps) {
  const { t } = useLanguage();
  const { logoutMutation, user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    logoutMutation.mutate();
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Notification bell */}
      <button type="button" className="relative p-1 text-gray-700 hover:text-primary focus:outline-none">
        <span className="material-icons">notifications</span>
        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white font-semibold">3</span>
      </button>

      {/* User menu with dropdown */}
      <div className="relative">
        <button 
          type="button" 
          className="flex items-center p-1 text-gray-700 hover:text-primary focus:outline-none"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <span className="material-icons mr-1">account_circle</span>
          <span className="hidden md:inline text-sm font-medium">{user?.fullName || t("User")}</span>
          <span className="material-icons text-sm ml-1">
            {showUserMenu ? "expand_less" : "expand_more"}
          </span>
        </button>
        
        {showUserMenu && (
          <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || t("User")}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.username || t("Username")}
              </p>
            </div>
            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <span className="material-icons text-sm mr-2 align-text-bottom">person</span>
              {t("Profile")}
            </Link>
            <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <span className="material-icons text-sm mr-2 align-text-bottom">settings</span>
              {t("Settings")}
            </Link>
            <button 
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              disabled={logoutMutation.isPending}
            >
              <span className="material-icons text-sm mr-2 align-text-bottom">logout</span>
              {t("Logout")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopNav;