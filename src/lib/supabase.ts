import { createClient } from '@supabase/supabase-js';

// Çevre değişkenleri
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Sahte istemci oluşturucu
const createMockClient = () => {
  const mockFunctionWithWarning = () => {
    console.error('Supabase çevre değişkenleri eksik! Lütfen .env.local dosyanızı kontrol edin veya Vercel ortamında çevre değişkenlerini ayarlayın.');
    return Promise.resolve({ data: null, error: new Error('Supabase yapılandırılmamış') });
  };

  return {
    from: () => ({
      select: mockFunctionWithWarning,
      insert: mockFunctionWithWarning,
      update: mockFunctionWithWarning,
      delete: mockFunctionWithWarning,
      eq: mockFunctionWithWarning,
      single: mockFunctionWithWarning,
      order: mockFunctionWithWarning
    }),
    auth: {
      signInWithPassword: mockFunctionWithWarning,
      signUp: mockFunctionWithWarning,
      signOut: mockFunctionWithWarning,
      onAuthStateChange: mockFunctionWithWarning,
      getSession: mockFunctionWithWarning
    },
    storage: {
      from: () => ({
        upload: mockFunctionWithWarning,
        getPublicUrl: mockFunctionWithWarning,
        list: mockFunctionWithWarning,
        remove: mockFunctionWithWarning
      })
    }
  };
};

// Mevcut global istemci (geriye dönük uyumluluk için)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

// Her rota için yeni bir istemci oluşturma fonksiyonu
export function createSupabaseClient() {
  // Gerçek değerler varsa Supabase istemcisi oluştur
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  
  // Değilse sahte istemci döndür (build için ve kullanıcıya anlaşılır hata göstermek için)
  console.warn('Supabase çevre değişkenleri eksik! Uygulama doğru çalışmayacak.');
  return createMockClient();
} 