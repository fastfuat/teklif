'use client';

import React, { useState } from 'react';
import { Brand, Category, Feature, Model } from '@/types';
import { createSupabaseClient } from '@/lib/supabase';

interface QuoteFormProps {
  features: Feature[];
  category: Category;
  brand: Brand;
  model: Model;
}

export default function QuoteForm({ features, category, brand, model }: QuoteFormProps) {
  const [phone, setPhone] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleFeatureSelect = (featureId: number, value: string) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [featureId]: value
    }));
  };

  const saveQuote = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = createSupabaseClient();
      
      // Save quote to database
      const { error: saveError } = await supabase.from('quotes').insert({
        category_id: category.id,
        brand_id: brand.id,
        model_id: model.id,
        selected_features: selectedFeatures,
        contact_number: phone
      });
      
      if (saveError) {
        console.error('Error saving quote:', saveError);
        throw new Error(saveError.message);
      }
      
      setSuccess(true);
      return true;
      
    } catch (error: unknown) {
      console.error('Error saving quote:', error);
      setError('Teklif kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppQuote = async () => {
    if (isLoading) return;
    
    // Resetle any previous errors
    setError(null);
    
    // Validate form
    if (!allFeaturesSelected && features.length > 0) {
      setError('Lütfen tüm özellikleri seçin.');
      return;
    }
    
    // Save the quote to the database
    const saved = await saveQuote();
    
    if (!saved) {
      return; // Hata durumunda devam etme
    }
    
    // Format the message for WhatsApp
    let message = `Merhaba, aşağıdaki cihaz için teklif almak istiyorum:\n\n`;
    message += `Kategori: ${category.name}\n`;
    message += `Marka: ${brand.name}\n`;
    message += `Model: ${model.name}\n\n`;
    
    if (Object.keys(selectedFeatures).length > 0) {
      message += `Özellikler:\n`;
      
      for (const featureId in selectedFeatures) {
        const feature = features.find(f => f.id.toString() === featureId);
        if (feature) {
          message += `- ${feature.name}: ${selectedFeatures[featureId]}\n`;
        }
      }
    }
    
    // Convert the message to URL format
    const encodedMessage = encodeURIComponent(message);
    
    // Redirect to WhatsApp with the message
    // Note: Replace the phone number with the actual one
    const whatsappNumber = '905XXXXXXXXX'; // Replace with your actual number
    window.location.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  };

  const allFeaturesSelected = features.length > 0 ? 
    features.every(feature => feature.id.toString() in selectedFeatures) : 
    true;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-4">
          <p>Teklifiniz başarıyla kaydedildi.</p>
        </div>
      )}
      
      {features.length > 0 ? (
        <>
          <h2 className="text-xl font-semibold mb-4">Cihaz Özellikleri</h2>
          
          {features.map((feature) => (
            <div key={feature.id} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {feature.name}
              </label>
              <select
                value={selectedFeatures[feature.id] || ''}
                onChange={(e) => handleFeatureSelect(feature.id, e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Seçiniz</option>
                {feature.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </>
      ) : (
        <p className="text-gray-500">Bu model için tanımlanmış özellik bulunmamaktadır.</p>
      )}

      <div className="mt-6">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Telefon Numarası (opsiyonel)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder="5XX XXX XX XX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={handleWhatsAppQuote}
          disabled={!allFeaturesSelected || isLoading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${allFeaturesSelected ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
          {isLoading ? 'Yükleniyor...' : 'WhatsApp ile Teklif Al'}
        </button>
        {!allFeaturesSelected && features.length > 0 && (
          <p className="mt-2 text-sm text-red-600">Lütfen tüm özellikleri seçin.</p>
        )}
      </div>
    </div>
  );
} 