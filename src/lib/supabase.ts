import { createClient } from '@supabase/supabase-js';

// Çevre değişkenleri veya varsayılan değerler
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Mevcut global istemci (geriye dönük uyumluluk için)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Her rota için yeni bir istemci oluşturma fonksiyonu
export function createSupabaseClient() {
  // Development veya production ortamında gerçek değerlerin kullanıldığından emin olun
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY çevre değişkenleri eksik. Build sırasında varsayılan değerler kullanılıyor, ancak üretim ortamında gerçek değerler gerekli.');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
} 