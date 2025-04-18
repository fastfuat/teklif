'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const router = useRouter();
  
  // Sayfa yüklendiğinde Supabase bağlantısını kontrol et
  useEffect(() => {
    async function checkConnection() {
      setConnectionStatus('checking');
      
      // Supabase URL'sini kontrol et
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        setError('Supabase URL tanımlanmamış. Lütfen site yöneticisi ile iletişime geçin.');
        setConnectionStatus('error');
        return;
      }
      
      try {
        // DNS çözümlenebilirliğini kontrol etmek için basit bir istek
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 saniye zaman aşımı
        
        await fetch(supabaseUrl, { 
          method: 'HEAD',
          signal: controller.signal,
          mode: 'no-cors', // CORS hatalarını önlemek için
          cache: 'no-cache'
        });
        
        clearTimeout(timeoutId);
        setConnectionStatus('ok');
      } catch (err) {
        console.error('Bağlantı kontrolü sırasında hata:', err);
        setConnectionStatus('error');
        setError(`Supabase sunucusuna erişilemiyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.
          
Supabase URL: ${supabaseUrl?.substring(0, 15)}...`);
      }
    }
    
    checkConnection();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (connectionStatus === 'error') {
      setError('Bağlantı sorunu devam ediyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseClient();
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('network') || 
            error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          setError('Bağlantı hatası: Supabase sunucusuna erişilemiyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
        } else {
          setError(error.message);
        }
        return;
      }

      // Başarılı giriş - admin paneline yönlendir
      router.push('/admin/dashboard');
      router.refresh();
    } catch (error: unknown) {
      let errorMessage = 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyiniz.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('network') ||
            error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          errorMessage = 'İnternet bağlantı sorunu: Sunucuya erişilemiyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.';
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

        {connectionStatus === 'checking' && (
          <div className="p-3 bg-blue-50 text-blue-700 rounded-md flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Bağlantı kontrol ediliyor...</span>
          </div>
        )}

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
              disabled={connectionStatus === 'error'}
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
              disabled={connectionStatus === 'error'}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || connectionStatus === 'error' || connectionStatus === 'checking'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Giriş yapılıyor...' : connectionStatus === 'checking' ? 'Bağlantı Kontrol Ediliyor...' : 'Giriş Yap'}
            </button>
          </div>

          {connectionStatus === 'error' && (
            <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
              <p className="font-bold mb-1">Bağlantı Sorunu</p>
              <p>Supabase sunucusuna erişilemiyor. Bu sorun şunlardan kaynaklanabilir:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>İnternet bağlantınızda bir sorun olabilir</li>
                <li>Supabase servisinde geçici bir kesinti olabilir</li>
                <li>DNS ayarlarınızda bir sorun olabilir</li>
              </ul>
              <p className="mt-2">Lütfen daha sonra tekrar deneyin veya site yöneticisiyle iletişime geçin.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 