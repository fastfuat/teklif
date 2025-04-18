'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Brand, Model } from '@/types';
import Link from 'next/link';

export default function BrandPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.brandId as string;
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!brandId) {
        router.push('/');
        return;
      }

      setIsLoading(true);
      try {
        const [brandResult, modelResult] = await Promise.all([
          supabase.from('brands').select('*, categories:category_id(id, name)').eq('id', brandId).single(),
          supabase.from('models').select('*').eq('brand_id', brandId).order('name')
        ]);

        if (brandResult.error) {
          throw brandResult.error;
        }

        setBrand(brandResult.data);
        setModels(modelResult.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [brandId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
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
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      {/* Brand Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="mb-4 sm:mb-0 sm:mr-6 flex-shrink-0 flex justify-center">
              {brand?.image_url ? (
                <img 
                  src={brand.image_url} 
                  alt={brand.name} 
                  className="h-24 w-24 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/150?text=Marka";
                  }}
                />
              ) : (
                <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center mb-1">
                <Link 
                  href={`/teklif-kategori/${brand?.categories?.id}`}
                  className="text-sm text-blue-600 hover:underline mr-2"
                >
                  {brand?.categories?.name}
                </Link>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{brand?.name}</h1>
              <p className="text-gray-600">Model Seçimi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {models.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {models.map((model) => (
                <div 
                  key={model.id} 
                  className="group flex flex-col border border-gray-200 rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-blue-400"
                >
                  <div className="relative h-48 bg-gray-100 p-4 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {model.image_url ? (
                      <img 
                        src={model.image_url} 
                        alt={model.name} 
                        className="max-h-40 max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/200?text=Model";
                        }}
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="p-4 flex-grow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{model.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Cihazınızı satmak için teklif alın
                    </p>
                  </div>
                  <div className="px-4 pb-4">
                    <Link 
                      href={`/teklif?category=${brand?.category_id}&brand=${brand?.id}&model=${model.id}`}
                      className="w-full block py-3 text-center bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                    >
                      <span>NAKİTE ÇEVİR</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Bu markada henüz model bulunmuyor</h3>
              <p className="text-gray-500">Lütfen daha sonra tekrar kontrol edin veya başka bir marka seçin</p>
              <Link 
                href={`/teklif-kategori/${brand?.category_id}`}
                className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition duration-200"
              >
                Markalara Dön
              </Link>
            </div>
          )}
        </div>
      </div>

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