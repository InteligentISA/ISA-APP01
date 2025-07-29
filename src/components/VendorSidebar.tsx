import { useState } from "react";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Store, 
  CreditCard, 
  Star, 
  Wallet, 
  Settings,
  User,
  Receipt,
  ChevronRight,
  LogOut,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VendorSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  userName: string;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const VendorSidebar = ({ 
  activeSection, 
  onSectionChange, 
  onLogout, 
  userName, 
  sidebarOpen = true,
  onSidebarToggle,
  isCollapsed: externalIsCollapsed,
  onCollapsedChange
}: VendorSidebarProps) => {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(true);
  
  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  const setIsCollapsed = onCollapsedChange || setInternalIsCollapsed;

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'store', label: 'My Store', icon: Store },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reviews', label: 'Customer Reviews', icon: Star },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleMobileClose = () => {
    if (onSidebarToggle) {
      onSidebarToggle();
    }
  };

  const handleDesktopToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={cn(
      "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      "lg:relative fixed top-0 left-0 z-50"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">Vendor Portal</h2>
              <p className="text-sm text-gray-600 truncate">{userName}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMobileClose}
              className="lg:hidden h-12 w-12"
            >
              <X className="h-5 w-5" />
            </Button>
            {/* Desktop collapse button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDesktopToggle}
              className="hidden lg:flex h-10 w-10"
            >
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed ? "rotate-0" : "rotate-180"
              )} />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-12 px-3 text-base",
                isActive && "bg-blue-600 text-white hover:bg-blue-700",
                !isActive && "text-gray-700 hover:bg-gray-100",
                isCollapsed && "px-2 justify-center h-12",
                "lg:h-10 lg:text-sm" // Smaller on desktop
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className={cn(
                "h-5 w-5 lg:h-4 lg:w-4", 
                !isCollapsed && "mr-3"
              )} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-12 px-3 text-base text-red-600 hover:bg-red-50 hover:text-red-700",
            isCollapsed && "px-2 justify-center h-12",
            "lg:h-10 lg:text-sm" // Smaller on desktop
          )}
          onClick={onLogout}
        >
          <LogOut className={cn(
            "h-5 w-5 lg:h-4 lg:w-4", 
            !isCollapsed && "mr-3"
          )} />
          {!isCollapsed && <span className="truncate">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default VendorSidebar; 