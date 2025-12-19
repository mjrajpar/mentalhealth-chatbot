import { MessageCircle, Phone, TrendingUp, History, Lightbulb, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  className?: string;
}

const navItems = [
  { icon: MessageCircle, label: "Chat", path: "/" },
  { icon: TrendingUp, label: "Progress", path: "/progress" },
  { icon: History, label: "History", path: "/history" },
  { icon: Lightbulb, label: "Activities", path: "/activities" },
  { icon: User, label: "Account", path: "/account" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside className={cn("w-16 lg:w-20 bg-sidebar border-r border-sidebar-border flex flex-col", className)}>
      {/* Logo */}
      <div className="p-3 lg:p-4 flex justify-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "nav-item",
              location.pathname === item.path && "nav-item-active"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="hidden lg:inline text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Crisis Help */}
      <div className="p-2 lg:p-3">
        <a
          href="tel:988"
          className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
        >
          <Phone className="w-5 h-5" />
          <span className="text-[10px] font-medium">988</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;