import { createClient } from '@supabase/supabase-js';

// URL'lerin geçerliliğini kontrol eden fonksiyon
function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
}

// Supabase URL ve API anahtarını daha güvenli şekilde al
const getSupabaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  
  if (!url) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is missing. Please check your .env.local file or Vercel environment variables.');
  }
  
  if (url && !isValidUrl(url)) {
    console.error(`Invalid Supabase URL: ${url}. Please check your environment variables.`);
  }
  
  return url;
};

const getSupabaseAnonKey = (): string => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!key) {
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Please check your .env.local file or Vercel environment variables.');
  }
  
  return key;
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Mevcut global istemci (geriye dönük uyumluluk için)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Her rota için yeni bir istemci oluşturma fonksiyonu
export function createSupabaseClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  
  if (!url || !key) {
    console.error('Supabase credentials are missing. Some features may not work correctly.');
  }
  
  // Özellikle yalın client options - retry ve fetch durumları için
  return createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      fetch: fetch,
      headers: {
        'X-Custom-Header': 'gadget-trade-app' // Troubleshooting için
      }
    }
  });
} 