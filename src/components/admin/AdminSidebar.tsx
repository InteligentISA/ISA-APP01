import { useState } from "react";
import { 
  Home, 
  Users, 
  Store, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Wallet,
  Shield,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  userName: string;
}

const AdminSidebar = ({ activeSection, onSectionChange, onLogout, userName }: AdminSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'vendors', label: 'Vendors', icon: Store },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setIsMobileOpen(false); // Close mobile menu when section changes
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white shadow-lg"
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-50",
        // Desktop: collapsible behavior
        "hidden lg:flex",
        isCollapsed ? "w-16" : "w-64",
        // Mobile: slide in/out behavior
        "lg:relative fixed left-0 top-0",
        isMobileOpen ? "flex w-64" : "hidden"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="hidden sm:inline">Admin Portal</span>
                  <span className="sm:hidden">Admin</span>
                </h2>
                <p className="text-sm text-gray-600 truncate">{userName}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto hidden lg:flex"
            >
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed ? "rotate-0" : "rotate-180"
              )} />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 px-3",
                  isActive && "bg-blue-600 text-white hover:bg-blue-700",
                  !isActive && "text-gray-700 hover:bg-gray-100",
                  isCollapsed && "px-2 justify-center hidden lg:flex"
                )}
                onClick={() => handleSectionChange(item.id)}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-10 px-3 text-red-600 hover:bg-red-50 hover:text-red-700",
              isCollapsed && "px-2 justify-center hidden lg:flex"
            )}
            onClick={onLogout}
          >
            <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar; 