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
  X,
  Menu,
  ChevronDown,
  RotateCcw,
  HeadphonesIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VendorSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userName: string;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const VendorSidebar = ({ 
  activeSection, 
  onSectionChange, 
  userName, 
  sidebarOpen = true,
  onSidebarToggle,
  isCollapsed: externalIsCollapsed,
  onCollapsedChange
}: VendorSidebarProps) => {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  
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
    { id: 'returns', label: 'Returns', icon: RotateCcw },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'support', label: 'Customer Support', icon: HeadphonesIcon },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      subItems: [
        { id: 'settings-account', label: 'Account', icon: User },
        { id: 'settings-payout', label: 'Payout', icon: CreditCard },
        { id: 'settings-billing', label: 'Billing', icon: Receipt }
      ]
    },
  ];

  const handleMobileClose = () => {
    if (onSidebarToggle) {
      onSidebarToggle();
    }
  };

  const handleDesktopToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setMobileMenuOpen(false); // Close mobile menu when section changes
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex h-full bg-white flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Desktop Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">Vendor Portal</h2>
                <p className="text-sm text-gray-600 truncate">{userName}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDesktopToggle}
                className="h-10 w-10 hover:bg-gray-100"
              >
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isCollapsed ? "rotate-0" : "rotate-180"
                )} />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id || (item.subItems && item.subItems.some(sub => activeSection === sub.id));
            const isSettings = item.id === 'settings';
            
            return (
              <div key={item.id} className="space-y-1">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 px-3 text-base rounded-lg transition-all duration-200",
                    isActive && "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
                    !isActive && "text-gray-700 hover:bg-gray-100",
                    isCollapsed && "px-2 justify-center h-12 w-12 mx-auto",
                    "lg:h-10 lg:text-sm"
                  )}
                  onClick={() => {
                    if (isSettings) {
                      setSettingsExpanded(!settingsExpanded);
                    } else {
                      onSectionChange(item.id);
                    }
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn(
                    "h-5 w-5 lg:h-4 lg:w-4 transition-all duration-200", 
                    !isCollapsed && "mr-3"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {isSettings && (
                        <ChevronDown className={cn(
                          "h-4 w-4 ml-auto transition-transform duration-200",
                          settingsExpanded ? "rotate-180" : "rotate-0"
                        )} />
                      )}
                    </>
                  )}
                </Button>
                
                {/* Settings Sub-items */}
                {isSettings && settingsExpanded && !isCollapsed && item.subItems && (
                  <div className="ml-6 space-y-1">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeSection === subItem.id;
                      
                      return (
                        <Button
                          key={subItem.id}
                          variant={isSubActive ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start h-10 px-3 text-sm rounded-lg transition-all duration-200",
                            isSubActive && "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
                            !isSubActive && "text-gray-600 hover:bg-gray-100"
                          )}
                          onClick={() => onSectionChange(subItem.id)}
                        >
                          <SubIcon className="h-4 w-4 mr-3" />
                          <span className="truncate">{subItem.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>


      </div>

      {/* Mobile Sidebar Content */}
      <div className={cn(
        "lg:hidden flex flex-col h-full bg-white",
        sidebarOpen ? "block" : "hidden"
      )}>
        {/* Mobile Header - Only show when sidebar is open */}
        {sidebarOpen && (
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMobileClose}
                  className="h-10 w-10"
                >
                  <X className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Vendor Portal</h2>
                  <p className="text-sm text-gray-600">{userName}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMobileMenuToggle}
                className="h-10 w-10 ml-auto"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Dropdown Menu */}
        <div className={cn(
          "bg-orange-50 border-b border-orange-200 shadow-lg transition-all duration-300",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}>
          <div className="p-4 space-y-2 bg-orange-50">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 px-4 text-base rounded-lg transition-all duration-200",
                    isActive && "bg-orange-500 text-white hover:bg-orange-600 shadow-md",
                    !isActive && "text-gray-700 hover:bg-orange-100 border border-orange-200"
                  )}
                  onClick={() => handleSectionChange(item.id)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
            
          </div>
        </div>

        {/* Mobile Navigation (when dropdown is closed) */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 px-4 text-base rounded-lg transition-all duration-200",
                  isActive && "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
                  !isActive && "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => handleSectionChange(item.id)}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>


      </div>
    </>
  );
};

export default VendorSidebar; 