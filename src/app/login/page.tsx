"use client";

import { useState } from 'react';
import { Shield, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

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
      } else {
        // Redirection is handled in the AuthContext, but we can also push here for immediate feedback
        toast({
          title: "Access Granted",
          description: "Initializing ShieldCore Neural connection.",
        });
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020408] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-destructive/5 rounded-full blur-3xl pointer-events-none" />
      
      <Card className="w-full max-w-md border-border/50 glass-card shadow-2xl z-10 animate-in zoom-in-95 duration-300">
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="flex justify-center">
            <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/20 text-destructive shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <Shield className="h-10 w-10" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">Analyst Login</CardTitle>
            <CardDescription className="text-gray-500 dark:text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-black opacity-60">Authorized personnel only</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-black uppercase text-center animate-in shake duration-300">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest opacity-50">Security Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@shieldcore.ai"
                className="bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/5 focus-visible:ring-destructive rounded-xl h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest opacity-50">Analyst Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/5 pr-10 focus-visible:ring-destructive rounded-xl h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-destructive hover:bg-destructive/90 text-white font-black h-14 rounded-xl shadow-lg shadow-destructive/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Sign In to Neural Core"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-10">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-muted-foreground opacity-40">
            <Lock className="h-3 w-3" />
            Secured with ShieldCore SSL
          </div>
          <div className="text-[8px] text-gray-400 dark:text-muted-foreground font-mono uppercase tracking-tighter opacity-30">
            v1.0.0 | System: ShieldCore Neural Cluster 92
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
