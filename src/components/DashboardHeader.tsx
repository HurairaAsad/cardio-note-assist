import { Search, Bell, Plus, Settings, LogOut, User, Home, LayoutDashboard, FileText, BarChart3, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

interface DashboardHeaderProps {
  onNewReport?: () => void;
  onSearch?: (query: string) => void;
}

export function DashboardHeader({ onNewReport, onSearch }: DashboardHeaderProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [{ title: "Home", href: "/", icon: Home }];
    
    if (segments.length > 0) {
      if (segments[0] === 'dashboard') {
        breadcrumbs.push({ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard });
      }
      
      if (segments.length > 1) {
        const current = segments[segments.length - 1];
        const pageInfo: { [key: string]: { title: string; icon: any } } = {
          'reports': { title: 'Reports', icon: FileText },
          'analytics': { title: 'Analytics', icon: BarChart3 },
          'billing': { title: 'Billing', icon: CreditCard },
          'settings': { title: 'Settings', icon: Settings }
        };
        
        const info = pageInfo[current] || { 
          title: current.charAt(0).toUpperCase() + current.slice(1), 
          icon: FileText 
        };
        breadcrumbs.push({ title: info.title, href: path, icon: info.icon });
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const isLastItem = (index: number) => index === breadcrumbs.length - 1;

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b glass-effect animate-slide-in-right">
        <div className="flex h-14 items-center gap-4 px-4">
          {/* Sidebar Toggle */}
          <SidebarTrigger className="-ml-1 touch-target" />

          {/* Enhanced Breadcrumbs */}
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  <BreadcrumbItem>
                    {isLastItem(index) ? (
                      <BreadcrumbPage className="flex items-center gap-1">
                        {crumb.icon && <crumb.icon className="h-3 w-3" />}
                        {crumb.title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        href={crumb.href} 
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        {crumb.icon && <crumb.icon className="h-3 w-3" />}
                        {crumb.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLastItem(index) && <BreadcrumbSeparator />}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Enhanced Search */}
          <div className="flex-1 max-w-sm">
            <div className="relative group">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Search reports, templates, data..."
                className="w-full pl-8 focus-visible-ring transition-all duration-200"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="flex items-center gap-2">
            {/* New Report Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={onNewReport} 
                  size="sm" 
                  className="gap-2 glow-hover touch-target"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Report</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create a new medical report</TooltipContent>
            </Tooltip>

            {/* Enhanced Notifications */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative soft-hover touch-target">
                  <Bell className="h-4 w-4" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse-gentle"
                  >
                    3
                  </Badge>
                  <span className="sr-only">Notifications</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications (3 new)</TooltipContent>
            </Tooltip>

            {/* Enhanced User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full soft-hover touch-target">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="Profile" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {profile?.full_name ? profile.full_name.slice(0, 2).toUpperCase() : 
                       user?.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 animate-scale-in" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {profile?.full_name || user?.email || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                    {profile?.specialty && (
                      <Badge variant="secondary" className="text-xs w-fit mt-1">
                        {profile.specialty}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard')} 
                  className="interactive-hover"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/settings')} 
                  className="interactive-hover"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={signOut} 
                  className="interactive-hover text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}