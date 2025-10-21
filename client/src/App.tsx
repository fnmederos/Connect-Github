import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/authUtils";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PendingApproval from "@/pages/PendingApproval";
import AdminPanel from "@/pages/AdminPanel";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Vehicles from "@/pages/Vehicles";
import History from "@/pages/History";
import Roles from "@/pages/Roles";
import ThemeToggle from "@/components/ThemeToggle";
import { LayoutDashboard, Users, Truck, History as HistoryIcon, Shield, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/employees" component={Employees} />
      <Route path="/vehicles" component={Vehicles} />
      <Route path="/roles" component={Roles} />
      <Route path="/history" component={History} />
      <Route path="/admin" component={AdminPanel} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard, testId: "link-dashboard" },
    { path: "/employees", label: "Empleados", icon: Users, testId: "link-employees" },
    { path: "/vehicles", label: "Vehículos", icon: Truck, testId: "link-vehicles" },
    { path: "/history", label: "Historial", icon: HistoryIcon, testId: "link-history" },
  ];

  // Add admin link if user is admin
  if (isAdmin) {
    navItems.push({ 
      path: "/admin", 
      label: "Panel Admin", 
      icon: Shield, 
      testId: "link-admin" 
    });
  }

  const getUserInitials = () => {
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return user?.username || user?.email || 'Usuario';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-8">
              <h1 className="text-lg font-semibold" data-testid="text-app-title">
                Gestión Logística
              </h1>
              <nav className="hidden md:flex items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className="gap-2"
                        data-testid={item.testId}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline" data-testid="text-user-name">
                      {getUserDisplayName()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <User className="w-4 h-4 mr-2" />
                    {user?.username}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <User className="w-4 h-4 mr-2" />
                    {user?.email}
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem disabled>
                      <Shield className="w-4 h-4 mr-2" />
                      Administrador
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="button-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <nav className="md:hidden flex items-center gap-2 pb-3 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2 flex-shrink-0"
                    data-testid={item.testId}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <AuthenticatedRouter />
      </main>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isApproved, isLoading } = useAuth();

  // Show loading skeleton while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-card sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
              <Skeleton className="h-8 w-40" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-32 hidden sm:block" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-8 w-48 mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  // Public routes (not authenticated)
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/" component={Landing} />
        <Route component={Landing} /> {/* Default route */}
      </Switch>
    );
  }

  // Show pending approval page if authenticated but not approved
  if (!isApproved) {
    return <PendingApproval />;
  }

  // Show authenticated app if approved
  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
