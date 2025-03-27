import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const [location] = useLocation();
  const { t } = useLanguage();

  const navigationItems = [
    { path: "/", icon: "dashboard", label: t("Home") },
    { path: "/crop-management", icon: "grass", label: t("Crops") },
    { path: "/irrigation", icon: "water_drop", label: t("Irrigation") },
    { path: "/loans", icon: "paid", label: t("Finance") },
    { path: "/assistant", icon: "forum", label: t("Chat") },
  ];

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 ${className}`}>
      <div className="grid grid-cols-5">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center py-2 ${
              location === item.path ? "text-primary" : "text-gray-500"
            }`}
          >
            <span className="material-icons">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MobileNav;
