import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Train, 
  Package, 
  Users, 
  BarChart3, 
  Route,
  Home,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const token = localStorage.getItem("access_token");

  // Helper function to decode JWT and get user role
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Extract user role from token on component mount
  useEffect(() => {
    if (token) {
      const payload = decodeToken(token);
      if (payload && payload.role) {
        setUserRole(payload.role);
      }
    }
  }, [token]);

  // Base navigation items (always visible)
  const baseNavigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Orders", href: "/orders", icon: Package },
    { name: "Routes", href: "/routes", icon: Route },
    { name: "Drivers", href: "/drivers", icon: Users },
  ];

  // Admin-only navigation items
  const adminNavigation = [
    { name: "Train Schedule", href: "/trains", icon: Train },
    { name: "Reports", href: "/reports", icon: BarChart3 },
  ];

  // Combine navigation based on user role
  const navigation = userRole === "admin" 
    ? [...baseNavigation, ...adminNavigation]
    : baseNavigation;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/logout/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).finally(() => {
        localStorage.removeItem("access_token");
        navigate("/login");
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Truck className="h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold">Kandypack Logistics</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                      isActive(item.href)
                        ? "bg-primary-foreground text-primary"
                        : "text-primary-foreground hover:bg-primary-foreground/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Login/Logout Button */}
              {token ? (
                <Button variant="default" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <Button variant="default" size="sm" onClick={() => navigate("/login")}>
                  Login
                </Button>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-primary border-t border-primary-foreground/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 transition-colors ${
                      isActive(item.href)
                        ? "bg-primary-foreground text-primary"
                        : "text-primary-foreground hover:bg-primary-foreground/10"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Login/Logout Button Mobile */}
              <div className="px-3 py-2">
                {token ? (
                  <Button variant="default" size="sm" onClick={handleLogout} className="w-full">
                    Logout
                  </Button>
                ) : (
                  <Button variant="default" size="sm" onClick={() => navigate("/login")} className="w-full">
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;