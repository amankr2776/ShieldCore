
"use client";

import { useState } from 'react';
import { Shield, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid credentials. Access denied.');
        toast({
          title: "Login Failed",
          description: "Unauthorized personnel only.",
          variant: "destructive"
        });
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-destructive/5 rounded-full blur-3xl pointer-events-none" />
      
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl z-10 animate-in zoom-in-95 duration-300">
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="flex justify-center">
            <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/20 text-destructive">
              <Shield className="h-10 w-10" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-extrabold tracking-tight">Analyst Login</CardTitle>
            <CardDescription className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Authorized personnel only</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium text-center animate-in shake duration-300">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Security Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@fusionx.ai"
                className="bg-background/50 border-border focus:ring-destructive"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Analyst Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-background/50 border-border pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-destructive hover:bg-destructive/90 text-white font-bold h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            Secured with SSL | 256-bit AES
          </div>
          <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
            v1.0.0 | Model: DistilBERT-HTTP
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
