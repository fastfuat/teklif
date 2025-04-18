'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else if (data.session) {
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && pathname === '/admin/login') {
          router.push('/admin/dashboard');
        }
        
        if (event === 'SIGNED_OUT' && pathname !== '/admin/login') {
          router.push('/admin/login');
        }
        
        setIsAuthenticated(!!session);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Only show login page if not authenticated
  if (pathname === '/admin/login') {
    return children;
  }

  // Show loading state until auth check is complete
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Require authentication for all other admin pages
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Compact Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-3 py-2 flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-80">
            <h1 className="text-lg font-bold text-blue-600">Admin Paneli</h1>
          </Link>
          
          <div className="flex items-center gap-2">
            {pathname !== '/admin/dashboard' && (
              <Link 
                href="/admin/dashboard"
                className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-100"
              >
                Ana Panel
              </Link>
            )}
            <Link 
              href="/"
              className="text-blue-600 hover:underline text-xs"
              target="_blank"
            >
              Site
            </Link>
            <button 
              onClick={handleSignOut}
              className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-100"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - More compact padding */}
      <main className="flex-1 p-3 md:p-4">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
      
      {/* Compact Footer */}
      <footer className="bg-white border-t py-2 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Cihaz Alım Teklifi
      </footer>
    </div>
  );
} 