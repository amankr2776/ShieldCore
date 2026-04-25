
'use client';

import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  updateProfile,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '@/firebase/config';
import { Shield, Github, Mail, Lock, User, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>, mode: 'login' | 'signup') => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        setSuccess(true);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (providerName: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt("Enter your email for password reset:");
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        toast({ title: "Reset Sent", description: "Check your inbox for password reset instructions." });
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] relative flex items-center justify-center overflow-hidden">
      {/* Hexagonal Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-12">
          <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/20 text-destructive mb-6 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <Shield className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white">
            SHIELDCORE <span className="text-destructive">WAF</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mt-2">Neural Access Terminal</p>
        </div>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-12 rounded-[2rem] text-center space-y-6">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto animate-bounce" />
            <h2 className="text-2xl font-black uppercase text-white">Account Created</h2>
            <p className="text-sm font-bold text-emerald-500/60 uppercase tracking-widest">Redirecting to Analysis Engine...</p>
          </div>
        ) : (
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 rounded-xl h-12 p-1 mb-8">
              <TabsTrigger value="signin" className="rounded-lg font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-destructive data-[state=active]:text-white">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-destructive data-[state=active]:text-white">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={(e) => handleEmailAuth(e, 'login')} className="space-y-4">
                <FloatingInput label="Security Email" id="email" type="email" icon={Mail} required />
                <FloatingInput label="Access Password" id="password" type="password" icon={Lock} required />
                
                {error && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest text-center">{error}</p>}

                <Button type="submit" disabled={loading} className="w-full h-14 bg-destructive hover:bg-destructive/90 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-destructive/20 mt-4 transition-all hover:scale-[1.02]">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Initiate Connection"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => handleEmailAuth(e, 'signup')} className="space-y-4">
                <FloatingInput label="Full Name" id="name" type="text" icon={User} required />
                <FloatingInput label="Security Email" id="email" type="email" icon={Mail} required />
                <FloatingInput label="Access Password" id="password" type="password" icon={Lock} required />

                {error && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest text-center">{error}</p>}

                <Button type="submit" disabled={loading} className="w-full h-14 bg-destructive hover:bg-destructive/90 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-destructive/20 mt-4 transition-all hover:scale-[1.02]">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Establish Credentials"}
                </Button>
              </form>
            </TabsContent>

            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Or Continue With</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleSocialAuth('google')} className="h-12 border-white/10 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase text-[9px] tracking-widest">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.94 0 3.51.67 4.7 1.77L20.1 3.4C17.65 1.41 14.51.5 12 .5 7.42.5 3.56 3.12 1.5 6.94l3.88 3.01c.91-2.73 3.51-4.91 6.62-4.91z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.42h6.44c-.28 1.48-1.08 2.74-2.33 3.58l3.62 2.81c2.12-1.95 3.76-4.83 3.76-8.47z"/>
                    <path fill="#34A853" d="M5.38 14.95c-.23-.69-.38-1.43-.38-2.21 0-.78.15-1.52.38-2.21L1.5 7.52C.54 9.42 0 11.64 0 14c0 2.36.54 4.58 1.5 6.48l3.88-3.01z"/>
                    <path fill="#FBBC05" d="M12 23.5c3.24 0 5.96-1.07 7.95-2.9l-3.62-2.81c-1.11.75-2.54 1.2-4.33 1.2-3.11 0-5.71-2.18-6.62-4.91l-3.88 3.01C3.56 20.88 7.42 23.5 12 23.5z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" onClick={() => handleSocialAuth('github')} className="h-12 border-white/10 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase text-[9px] tracking-widest">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              </div>

              <div className="text-center">
                <button onClick={handleForgotPassword} className="text-[9px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-400 transition-colors">
                  Forgot Security Password?
                </button>
              </div>
            </div>
          </Tabs>
        )}

        <div className="mt-12 text-center opacity-20">
          <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-white">ShieldCore Encryption Active // SSL Enabled</p>
        </div>
      </div>
    </div>
  );
}

function FloatingInput({ label, icon: Icon, ...props }: any) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-destructive transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      <Input
        {...props}
        placeholder=" "
        className="h-14 pl-12 pt-5 bg-white/5 border-white/10 focus-visible:ring-destructive rounded-xl font-mono text-xs peer"
      />
      <Label className="absolute left-12 top-4 text-[10px] font-black uppercase tracking-widest text-white/30 pointer-events-none transition-all peer-focus:top-2 peer-focus:text-[8px] peer-focus:text-destructive peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[8px]">
        {label}
      </Label>
    </div>
  );
}
