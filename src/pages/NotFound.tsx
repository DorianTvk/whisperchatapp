
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { ModeToggle } from "@/components/mode-toggle";
import { MessageSquare, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <Button variant="ghost" size="icon" asChild>
          <Link to={isAuthenticated ? "/dashboard" : "/"}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <ModeToggle />
      </div>
      
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <MessageSquare className="h-16 w-16 text-primary animate-pulse-subtle" />
            <span className="absolute right-0 top-0 text-2xl font-bold">?</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to={isAuthenticated ? "/dashboard" : "/"}>
              <Home className="mr-2 h-4 w-4" />
              Go {isAuthenticated ? "to Dashboard" : "Home"}
            </Link>
          </Button>
          
          {!isAuthenticated && (
            <Button variant="outline" asChild>
              <Link to="/login">
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <footer className="absolute bottom-4 text-center w-full text-sm text-muted-foreground">
        Whisper © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
