import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Vehicles from "@/pages/Vehicles";
import History from "@/pages/History";
import ThemeToggle from "@/components/ThemeToggle";
import { LayoutDashboard, Users, Truck, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/employees" component={Employees} />
      <Route path="/vehicles" component={Vehicles} />
      <Route path="/history" component={History} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard, testId: "link-dashboard" },
    { path: "/employees", label: "Empleados", icon: Users, testId: "link-employees" },
    { path: "/vehicles", label: "Vehículos", icon: Truck, testId: "link-vehicles" },
    { path: "/history", label: "Historial", icon: HistoryIcon, testId: "link-history" },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
                <ThemeToggle />
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
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
