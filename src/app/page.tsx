'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, Brand, Model } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex items-center">
          <Link href="/" className="flex items-center">
            <div className="bg-blue-600 text-white p-2 rounded-md mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">ServisVer</span>
              <p className="text-xs text-gray-500">Cihazınız için hızlı ve kolay teklif alın</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Cihazınız İçin En İyi Teklifi Alın
          </h1>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-10">
            Eski cihazınızı değerlendirmek için hızlı ve güvenilir çözüm. Sadece birkaç adımda teklifinizi alın.
          </p>
        </div>
      </section>

      {/* Category Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/teklif-kategori/${category.id}`}
                className="group flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl overflow-hidden bg-white border border-gray-200 hover:border-blue-400"
              >
                <div className="relative mb-4 w-full h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name} 
                      className="h-40 w-40 object-contain group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/200?text=Kategori";
                      }}
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-medium text-center mb-2 px-2 group-hover:text-blue-600 transition-colors duration-300">{category.name}</h3>
                <div className="w-full mt-auto">
                  <div className="py-3 text-center bg-blue-600 text-white font-medium group-hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2">
                    <span>NAKİTE ÇEVİR</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Nasıl Çalışır?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Cihazınızı Seçin</h3>
              <p className="text-gray-600">
                Kategoriden başlayarak marka ve modelinizi seçin. Binlerce cihaz modelini destekliyoruz.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Durumunu Belirtin</h3>
              <p className="text-gray-600">
                Cihazınızın mevcut durumunu soruları yanıtlayarak belirtin. Bu, teklifinizin adil olmasını sağlar.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Teklifinizi Alın</h3>
              <p className="text-gray-600">
                Anında oluşturulan teklifinizi görün ve satış işlemini başlatmak için iletişim bilgilerinizi bırakın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">Neden Bizi Tercih Etmelisiniz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">En İyi Fiyat Garantisi</h3>
              <p className="text-gray-600">Piyasadaki en rekabetçi fiyatları sunuyoruz. Daha iyi bir teklif bulursanız, fiyatımızı iyileştiriyoruz.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Hızlı Süreç</h3>
              <p className="text-gray-600">Teklifinizi anında alın ve 24 saat içinde ödemenizi yapıyoruz. Zaman kaybetmeden işleminizi tamamlayın.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Güvenli İşlem</h3>
              <p className="text-gray-600">Tüm verileriniz güvenle korunur. Güvenli ödeme sistemleri ve şeffaf süreçlerle çalışıyoruz.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Kolay Kullanım</h3>
              <p className="text-gray-600">Basit ve kullanıcı dostu arayüzümüz sayesinde teklifinizi hızlıca alabilirsiniz. Karmaşık süreçler yok.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="https://wa.me/905XXXXXXXXX" 
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110"
          aria-label="WhatsApp ile iletişime geçin"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-6 w-6 fill-current">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
