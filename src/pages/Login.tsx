
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AuthError } from "@supabase/supabase-js";
import { Navigate } from "react-router-dom";

// Simplified login schema with fewer validations for faster processing
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    server?: string;
  }>({});

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Auto-redirect after 10 seconds if still waiting
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isLoading && loginAttempted) {
      timeout = setTimeout(() => {
        toast({
          title: "Taking longer than expected",
          description: "You'll be redirected once login completes",
          duration: 5000,
        });
      }, 10000);
    }
    
    return () => clearTimeout(timeout);
  }, [isLoading, loginAttempted, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginAttempted(true);
    setErrors({});
    
    try {
      // Minimal validation - just check that fields aren't empty
      if (!formData.email) {
        setErrors({ email: "Email is required" });
        setIsLoading(false);
        return;
      }
      
      if (!formData.password) {
        setErrors({ password: "Password is required" });
        setIsLoading(false);
        return;
      }
      
      // Immediate toast to show login is processing
      toast({
        title: "Logging in...",
        description: "Please wait while we verify your credentials",
      });
      
      // Skip full validation with Zod for faster processing
      // Just attempt login directly
      await login(formData.email, formData.password);
      
      // Only show success toast briefly to avoid delays
      toast({
        title: "Success!",
        description: "Redirecting you to dashboard...",
        duration: 2000,
      });
      
      // Navigate immediately
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      
      // Simplified error handling
      let errorMessage = "Login failed. Please try again.";
      
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof AuthError) {
        errorMessage = error.message || errorMessage;
        setErrors({ server: errorMessage });
      } else {
        setErrors({ server: errorMessage });
      }
      
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="max-w-md w-full glass p-8 sm:p-10 rounded-xl border border-border/50 animate-scale-in">
        <div className="space-y-2 text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.server && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {errors.server}
            </div>
          )}
          
          {isLoading && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm">Logging in...</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "border-destructive" : ""}
              autoComplete="email"
              required
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button variant="link" className="px-0 h-auto text-xs font-normal" asChild>
                <Link to="#">Forgot password?</Link>
              </Button>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "border-destructive" : ""}
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Button variant="link" className="p-0 h-auto font-normal" asChild>
              <Link to="/register">Sign up</Link>
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
