import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Mevcut global istemci (geriye dönük uyumluluk için)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Her rota için yeni bir istemci oluşturma fonksiyonu
export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Please check your .env.local file.');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
} 