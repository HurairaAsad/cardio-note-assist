import { Search, Bell, Plus, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    
    const breadcrumbs = [{ title: "Dashboard", href: "/dashboard" }];
    
    if (segments.length > 1) {
      const current = segments[segments.length - 1];
      const title = current.charAt(0).toUpperCase() + current.slice(1);
      breadcrumbs.push({ title, href: path });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const isLastItem = (index: number) => index === breadcrumbs.length - 1;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Sidebar Toggle */}
        <SidebarTrigger className="-ml-1" />

        {/* Breadcrumbs */}
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                <BreadcrumbItem>
                  {isLastItem(index) ? (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>{crumb.title}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLastItem(index) && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Search */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reports..."
              className="w-full pl-8"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {/* New Report Button */}
          <Button onClick={onNewReport} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Report</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="Profile" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {profile?.full_name ? profile.full_name.slice(0, 2).toUpperCase() : 
                     user?.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">
                    {profile?.full_name || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}