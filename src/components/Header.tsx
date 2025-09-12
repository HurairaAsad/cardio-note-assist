
import { Button } from "@/components/ui/button";
import { Stethoscope, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Do My Note</h1>
              <p className="text-sm text-muted-foreground">AI Clinical Notes</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
