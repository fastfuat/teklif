'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Brand, Model } from '@/types';
import Link from 'next/link';

export default function AdminModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newModel, setNewModel] = useState({ 
    name: '', 
    brand_id: '',
    image_url: '' 
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [modelResponse, brandResponse] = await Promise.all([
        supabase.from('models').select(`
          *,
          brands:brand_id(id, name, category_id)
        `).order('name'),
        supabase.from('brands').select('*').order('name')
      ]);
      
      if (modelResponse.error) throw modelResponse.error;
      if (brandResponse.error) throw brandResponse.error;
      
      setModels(modelResponse.data || []);
      setBrands(brandResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewModel(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newModel.name.trim() || !newModel.brand_id) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = '';
      
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `modeller/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('image')
          .upload(filePath, selectedFile);
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data } = supabase.storage
          .from('image')
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }
      
      const { error } = await supabase
        .from('models')
        .insert([{ 
          name: newModel.name,
          brand_id: parseInt(newModel.brand_id),
          image_url: imageUrl || null
        }]);
      
      if (error) {
        throw error;
      }
      
      // Reset form and refresh models
      setNewModel({ name: '', brand_id: '', image_url: '' });
      setSelectedFile(null);
      fetchData();
    } catch (error) {
      console.error('Error adding model:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (!window.confirm('Bu modeli silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      // İlk olarak model bilgilerini alalım (görseli silmek için)
      const { data: modelData, error: fetchError } = await supabase
        .from('models')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }

      // Model görselini storage'dan silme
      if (modelData?.image_url) {
        try {
          // URL'den dosya yolunu çıkar
          let filePath;
          
          // Standart publicURL formatı
          const standardMatch = modelData.image_url.match(/\/storage\/v1\/object\/public\/image\/(.*)/);
          if (standardMatch && standardMatch[1]) {
            filePath = decodeURIComponent(standardMatch[1]);
          } else {
            // Alternatif URL formatı (tam URL biçimi)
            const fullUrlMatch = modelData.image_url.match(/https:\/\/.*\/storage\/v1\/object\/public\/image\/(.*)/);
            if (fullUrlMatch && fullUrlMatch[1]) {
              filePath = decodeURIComponent(fullUrlMatch[1]);
            } else {
              // Dosya adını al
              const fileName = modelData.image_url.split('/').pop();
              if (fileName) {
                filePath = `modeller/${fileName}`;
              }
            }
          }
          
          if (filePath) {
            console.log('Silinecek model görseli:', filePath);
            const { error: storageError, data } = await supabase.storage
              .from('image')
              .remove([filePath]);
            
            if (storageError) {
              console.error('Model görseli silme hatası:', storageError);
            } else {
              console.log('Model görseli başarıyla silindi:', data);
            }
          } else {
            console.error('Dosya yolu çıkarılamadı:', modelData.image_url);
          }
        } catch (error) {
          console.error('Görsel silme işlemi sırasında hata:', error);
        }
      }

      // Modeli sil
      const { error: deleteError } = await supabase
        .from('models')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Modelleri yenile
      fetchData();
    } catch (error) {
      console.error('Model silme hatası:', error);
      alert('Model silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-blue-600">Modeller</h1>
          <p className="text-sm text-gray-500">Cihaz modellerini yönetin</p>
        </div>
        <Link 
          href="/admin/dashboard"
          className="text-blue-600 hover:underline text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Admin Paneline Dön
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yeni Model Ekle */}
        <div className="bg-white rounded-md shadow-sm border p-4">
          <h2 className="text-base font-medium mb-4">Yeni Model Ekle</h2>
          
          <form onSubmit={handleAddModel} className="space-y-4">
            <div>
              <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700 mb-1">
                Marka
              </label>
              <select
                id="brand_id"
                name="brand_id"
                value={newModel.brand_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Marka seçin</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Model Adı
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newModel.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Model Görseli
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => document.getElementById('image')?.click()}
                  className="bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm hover:bg-blue-100"
                >
                  Dosya Seç
                </button>
                <span className="text-sm text-gray-500">
                  {selectedFile ? selectedFile.name : 'Dosya seçilmedi'}
                </span>
                <input
                  type="file"
                  id="image"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP formatları desteklenir.</p>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? 'Ekleniyor...' : 'Model Ekle'}
            </button>
          </form>
        </div>
        
        {/* Mevcut Modeller */}
        <div className="bg-white rounded-md shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-base font-medium">Mevcut Modeller</h2>
          </div>
          
          <div className="p-2">
            {models.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Görsel
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model Adı
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marka
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {models.map((model) => (
                      <tr key={model.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="h-10 w-10 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                            {model.image_url ? (
                              <img 
                                src={model.image_url} 
                                alt={model.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full text-gray-400 text-xs">
                                Görsel Yok
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-xs text-gray-900">
                            {model.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {model.id}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {model.brands?.name || 'Bilinmiyor'}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                          <button
                            onClick={() => handleDeleteModel(model.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Modeli Sil"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                Henüz model bulunmamaktadır.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 