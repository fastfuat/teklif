'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseClient();
      
      // Önce bağlantı kontrolü yap
      try {
        // Ping atarak bağlantı kontrolü
        await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL || '', { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (connectionError) {
        setError('Supabase sunucusuna bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
          setError('Bağlantı hatası: Sunucuya erişilemedi. Lütfen internet bağlantınızı kontrol edin.');
        } else {
          setError(error.message);
        }
        return;
      }

      // Redirect to admin dashboard on successful login
      router.push('/admin/dashboard');
      router.refresh();
    } catch (error: unknown) {
      let errorMessage = 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyiniz.';
      
      // Hata tipini kontrol et
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
          errorMessage = 'İnternet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.';
        } else {
          errorMessage = `Hata: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-center">Admin Girişi</h1>
          <p className="mt-2 text-center text-gray-600">
            Yönetici panelinize erişmek için giriş yapın
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 