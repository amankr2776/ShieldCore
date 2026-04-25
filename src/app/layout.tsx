
import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { WafNavbar } from '@/components/waf-navbar';
import { AuthProvider } from '@/context/auth-context';
import { LoadingScreen } from '@/components/loading-screen';

export const metadata: Metadata = {
  title: 'FusionX WAF | AI Security Dashboard',
  description: 'AI-Powered Web Application Firewall',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-[#020408] text-foreground min-h-screen flex flex-col">
        <LoadingScreen />
        <AuthProvider>
          <SidebarProvider defaultOpen={false}>
            <div className="flex flex-col w-full min-h-screen relative">
              <WafNavbar />
              <main className="flex-1 relative z-10">
                {children}
              </main>
            </div>
            <Toaster />
          </SidebarProvider>
          {/* Global Version Badge */}
          <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
            <div className="bg-secondary/40 backdrop-blur-md border border-destructive/20 px-3 py-1 rounded-full text-[10px] font-mono text-muted-foreground shadow-lg">
              FusionX WAF v1.0.0 | CSIC 2010
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
