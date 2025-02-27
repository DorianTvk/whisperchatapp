
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/context/auth-context";
import { ArrowRight, MessageSquare, Users, Shield, Globe } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Animation on mount
    setTimeout(() => setLoaded(true), 100);
    
    // Redirect if already logged in
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <header className="w-full py-4 px-6 flex items-center justify-between glass border-b border-border/5 z-10 fixed animate-fade-in">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight">Whisper</h1>
        </div>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <div className="hidden sm:flex space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 mt-16">
        <div className={`max-w-4xl w-full space-y-12 transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="space-y-4 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Connect with anyone, anywhere
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A minimalist chat experience that puts privacy and elegance first
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/register">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`glass p-6 rounded-xl transition-all duration-500 delay-100 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-primary/5 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Personal Chat</h3>
              <p className="text-muted-foreground">
                Connect privately with friends, family, or colleagues with end-to-end encryption.
              </p>
            </div>
            
            <div className={`glass p-6 rounded-xl transition-all duration-500 delay-200 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-primary/5 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Group Chat</h3>
              <p className="text-muted-foreground">
                Create and manage groups for teams, projects, or communities with powerful moderation tools.
              </p>
            </div>
            
            <div className={`glass p-6 rounded-xl transition-all duration-500 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-primary/5 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Privacy First</h3>
              <p className="text-muted-foreground">
                Your conversations stay private with strong security features and minimal data collection.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 px-6 border-t border-border/10 mt-auto animate-fade-in">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">Whisper © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
