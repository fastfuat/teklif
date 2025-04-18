'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

interface Feature {
  id: number;
  name: string;
  options: string[];
  model_id: number;
}

interface DeviceInfo {
  category: { id: number; name: string };
  brand: { id: number; name: string };
  model: { id: number; name: string };
}

export default function QuotePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryId = searchParams.get('category');
  const brandId = searchParams.get('brand');
  const modelId = searchParams.get('model');

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string>>({});
  const [contactNumber, setContactNumber] = useState('');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId || !brandId || !modelId) {
      router.push('/');
      return;
    }

    const fetchDeviceInfo = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const supabase = createSupabaseClient();
        
        const [categoryResult, brandResult, modelResult, featuresResult] = await Promise.all([
          supabase.from('categories').select('*').eq('id', categoryId).single(),
          supabase.from('brands').select('*').eq('id', brandId).single(),
          supabase.from('models').select('*').eq('id', modelId).single(),
          supabase.from('features').select('*').eq('model_id', modelId).order('name')
        ]);

        if (categoryResult.error) {
          throw new Error(`Kategori bilgileri alınamadı: ${categoryResult.error.message}`);
        }
        
        if (brandResult.error) {
          throw new Error(`Marka bilgileri alınamadı: ${brandResult.error.message}`);
        }
        
        if (modelResult.error) {
          throw new Error(`Model bilgileri alınamadı: ${modelResult.error.message}`);
        }

        setDeviceInfo({
          category: categoryResult.data,
          brand: brandResult.data,
          model: modelResult.data
        });

        setFeatures(featuresResult.data || []);
      } catch (error) {
        console.error('Error fetching device info:', error);
        setError('Cihaz bilgileri alınırken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeviceInfo();
  }, [categoryId, brandId, modelId, router]);

  const handleFeatureSelect = (featureId: number, optionValue: string) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [featureId.toString()]: optionValue
    }));
  };

  const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactNumber(e.target.value);
  };

  const handleNext = () => {
    if (step === 1) {
      const allFeaturesSelected = features.every(feature => 
        selectedFeatures[feature.id]
      );

      if (!allFeaturesSelected) {
        alert('Lütfen tüm özellikleri seçin');
        return;
      }
    }

    setStep(prev => prev + 1);
    
    if (step === 1) {
      // Hesaplama yapalım
      calculateQuoteAmount();
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const calculateQuoteAmount = () => {
    // Basit hesaplama - gerçek uygulamada daha karmaşık olacaktır
    const baseAmount = 1000; // Baz teklif tutarı
    let multiplier = 1.0;

    // Seçilen özelliklere göre çarpan ayarlama
    Object.entries(selectedFeatures).forEach(([featureId, value]) => {
      const feature = features.find(f => f.id.toString() === featureId);
      if (!feature) return;
      
      // Her bir özellik için değere göre çarpan ayarlama
      // Örnek: "Çok İyi" +0.2, "İyi" +0.1, "Orta" -0.1, "Kötü" -0.2
      switch (value) {
        case 'Çok İyi':
          multiplier += 0.2;
          break;
        case 'İyi':
          multiplier += 0.1;
          break;
        case 'Orta':
          multiplier -= 0.1;
          break;
        case 'Kötü':
          multiplier -= 0.2;
          break;
      }
    });

    // Son teklif tutarını hesaplama
    const finalAmount = Math.round(baseAmount * multiplier);
    setQuoteAmount(finalAmount);
  };

  const handleSubmit = async () => {
    if (!contactNumber || contactNumber.length < 10) {
      alert('Lütfen geçerli bir telefon numarası girin');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createSupabaseClient();
      
      const { error: submitError } = await supabase.from('quotes').insert([{
        category_id: parseInt(categoryId!),
        brand_id: parseInt(brandId!),
        model_id: parseInt(modelId!),
        selected_features: selectedFeatures,
        contact_number: contactNumber
      }]);

      if (submitError) throw submitError;

      setQuoteSubmitted(true);
    } catch (error: unknown) {
      console.error('Error submitting quote:', error);
      setError('Teklif gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bir Hata Oluştu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  if (quoteSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Teklifiniz Alındı!</h2>
            <p className="text-gray-600">
              Teklifinizi inceledikten sonra en kısa sürede sizinle iletişime geçeceğiz.
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Cihaz</span>
              <span className="font-medium">{deviceInfo?.brand.name} {deviceInfo?.model.name}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Kategori</span>
              <span className="font-medium">{deviceInfo?.category.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Teklif Tutarı</span>
              <span className="text-xl font-bold text-green-600">{quoteAmount?.toLocaleString('tr-TR')} TL</span>
            </div>
          </div>
          
          <Link 
            href="/"
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition duration-200"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">Gadget Trade</Link>
          <Link href="/" className="text-sm text-blue-600 hover:underline">Ana Sayfaya Dön</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Progress Steps */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  1
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Cihaz Durumu</p>
                </div>
              </div>
              <div className="hidden sm:block w-16 h-0.5 bg-gray-200"></div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  2
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Teklif</p>
                </div>
              </div>
              <div className="hidden sm:block w-16 h-0.5 bg-gray-200"></div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 3 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  3
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">İletişim</p>
                </div>
              </div>
            </div>
          </div>

          {/* Device Info */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {deviceInfo?.brand.name} {deviceInfo?.model.name}
            </h1>
            <p className="text-sm text-gray-500">
              {deviceInfo?.category.name} kategorisinde
            </p>
          </div>

          {/* Step 1: Features */}
          {step === 1 && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Cihazınızın Durumunu Belirtin</h2>
              <p className="text-gray-600 mb-6">
                Cihazınızın mevcut durumunu aşağıdaki sorulara cevap vererek belirtin. Bu, teklifinizi etkileyecektir.
              </p>

              <div className="space-y-6">
                {features.length > 0 ? (
                  features.map((feature) => (
                    <div key={feature.id} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">{feature.name}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {feature.options.map((option: string, index: number) => (
                          <div 
                            key={index}
                            onClick={() => handleFeatureSelect(feature.id, option)}
                            className={`border rounded-md p-3 cursor-pointer transition-colors ${
                              selectedFeatures[feature.id] === option
                                ? 'border-blue-500 bg-blue-50'
                                : 'hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full border ${
                                selectedFeatures[feature.id] === option
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              } mr-2`}>
                                {selectedFeatures[feature.id] === option && (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm">{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Bu model için henüz özellik tanımlanmamış. Lütfen daha sonra tekrar deneyin.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Quote */}
          {step === 2 && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Teklifiniz Hazır</h2>
              <p className="text-gray-600 mb-6">
                Cihazınızın durumuna göre belirlenen satın alma teklifimiz aşağıdadır.
              </p>

              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <p className="text-sm text-blue-700 mb-4">Cihaz Bilgileri</p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kategori:</span>
                    <span className="font-medium">{deviceInfo?.category.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marka:</span>
                    <span className="font-medium">{deviceInfo?.brand.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-medium">{deviceInfo?.model.name}</span>
                  </div>
                </div>

                <div className="border-t border-blue-200 pt-4 mt-4">
                  <p className="text-sm text-blue-700 mb-4">Cihaz Durumu</p>
                  <div className="space-y-2 mb-6">
                    {features.map((feature) => (
                      <div key={feature.id} className="flex justify-between">
                        <span className="text-gray-600">{feature.name}:</span>
                        <span className="font-medium">{selectedFeatures[feature.id] || 'Seçilmedi'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-blue-200 pt-4 mt-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-gray-600 text-sm">Teklif Tutarı</p>
                      <p className="text-3xl font-bold text-blue-600">{quoteAmount?.toLocaleString('tr-TR')} TL</p>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                      <p>Bu teklif 24 saat geçerlidir</p>
                      <p>{new Date().toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  * Teklif, cihazınızın fiziksel durumu onaylandıktan sonra kesinleşecektir.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Contact */}
          {step === 3 && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">İletişim Bilgileriniz</h2>
              <p className="text-gray-600 mb-6">
                Satış işlemini başlatmak için lütfen telefon numaranızı girin. Uzmanlarımız en kısa sürede sizinle iletişime geçecek.
              </p>

              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={contactNumber}
                  onChange={handleContactNumberChange}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Telefon numaranız sadece bu satış işlemi için kullanılacaktır.
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 mb-6 flex">
                <div className="text-yellow-600 mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-yellow-800">
                  Telefon numaranızı girdikten sonra, satış uzmanımız 24 saat içinde sizinle iletişime geçecek ve teslim sürecini başlatacaktır.
                </p>
              </div>

              <div className="flex items-center mb-6">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                  Kişisel verilerimin işlenmesine ve <a href="#" className="text-blue-600 hover:underline">Aydınlatma Metni</a>&apos;nde belirtilen koşullara onay veriyorum.
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-200"
              >
                Geri
              </button>
            ) : (
              <Link
                href="/"
                className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-200"
              >
                İptal
              </Link>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Devam
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Teklifi Onayla'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 