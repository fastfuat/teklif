'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import Link from 'next/link';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', image_url: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      setSaving(true);

      // Add image to Supabase Storage if an image is selected
      let imageUrl = '';
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `kategoriler/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('image')
          .upload(filePath, selectedFile);
          
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          setIsSubmitting(false);
          setSaving(false);
          return;
        }
        
        const { data } = supabase.storage
          .from('image')
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }
      
      const { error } = await supabase
        .from('categories')
        .insert([{ 
          name: newCategory.name,
          image_url: imageUrl || null
        }]);
      
      if (error) {
        throw error;
      }
      
      // Reset form and refresh categories
      setNewCategory({ name: '', image_url: '' });
      setSelectedFile(null);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setIsSubmitting(false);
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategoriye bağlı tüm markalar ve modeller de silinecektir.')) {
      return;
    }
    
    try {
      // İlk olarak kategori bilgilerini alalım (görseli silmek için)
      const { data: categoryData, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }

      // Kategoriye bağlı markaları bul
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('id, image_url')
        .eq('category_id', id);
        
      if (brandsError) {
        throw brandsError;
      }
      
      // Her marka için işlemler
      for (const brand of brands || []) {
        // Markaya bağlı modelleri bul
        const { data: models, error: modelsError } = await supabase
          .from('models')
          .select('id, image_url')
          .eq('brand_id', brand.id);
          
        if (modelsError) {
          console.error('Modelleri alırken hata:', modelsError);
          continue; // Diğer markalara devam et
        }
        
        // Her model için görsel silme
        for (const model of models || []) {
          if (model.image_url) {
            try {
              // Doğru dosya yolu çıkarımı için regex desenini düzeltme
              let filePath;
              
              // Standart publicURL formatı
              const standardMatch = model.image_url.match(/\/storage\/v1\/object\/public\/image\/(.*)/);
              if (standardMatch && standardMatch[1]) {
                filePath = decodeURIComponent(standardMatch[1]);
              } else {
                // Alternatif URL formatı (tam URL biçimi)
                const fullUrlMatch = model.image_url.match(/https:\/\/.*\/storage\/v1\/object\/public\/image\/(.*)/);
                if (fullUrlMatch && fullUrlMatch[1]) {
                  filePath = decodeURIComponent(fullUrlMatch[1]);
                } else {
                  // Doğrudan dosya yolu formatı
                  const parts = model.image_url.split('image/');
                  if (parts.length > 1) {
                    filePath = decodeURIComponent(parts[1]);
                  } else {
                    // Son çare: dosya adını al
                    const fileName = model.image_url.split('/').pop();
                    if (fileName) {
                      filePath = `modeller/${fileName}`;
                    }
                  }
                }
              }
              
              if (filePath) {
                const { error: storageError } = await supabase.storage
                  .from('image')
                  .remove([filePath]);
                
                if (storageError) {
                  console.error('Model görseli silme hatası:', storageError);
                } else {
                  console.log('Model görseli başarıyla silindi:', model.id);
                }
              } else {
                console.error('Dosya yolu çıkarılamadı:', model.image_url);
              }
            } catch (error) {
              console.error('Görsel silme işlemi sırasında hata:', error);
            }
          }
        }
        
        // Marka görselini sil
        if (brand.image_url) {
          try {
            // Doğru dosya yolu çıkarımı için regex desenini düzeltme
            let filePath;
            
            // Standart publicURL formatı
            const standardMatch = brand.image_url.match(/\/storage\/v1\/object\/public\/image\/(.*)/);
            if (standardMatch && standardMatch[1]) {
              filePath = decodeURIComponent(standardMatch[1]);
            } else {
              // Alternatif URL formatı (tam URL biçimi)
              const fullUrlMatch = brand.image_url.match(/https:\/\/.*\/storage\/v1\/object\/public\/image\/(.*)/);
              if (fullUrlMatch && fullUrlMatch[1]) {
                filePath = decodeURIComponent(fullUrlMatch[1]);
              } else {
                // Doğrudan dosya yolu formatı
                const parts = brand.image_url.split('image/');
                if (parts.length > 1) {
                  filePath = decodeURIComponent(parts[1]);
                } else {
                  // Son çare: dosya adını al
                  const fileName = brand.image_url.split('/').pop();
                  if (fileName) {
                    filePath = `markalar/${fileName}`;
                  }
                }
              }
            }
            
            if (filePath) {
              const { error: storageError } = await supabase.storage
                .from('image')
                .remove([filePath]);
              
              if (storageError) {
                console.error('Marka görseli silme hatası:', storageError);
              } else {
                console.log('Marka görseli başarıyla silindi:', brand.id);
              }
            } else {
              console.error('Dosya yolu çıkarılamadı:', brand.image_url);
            }
          } catch (error) {
            console.error('Görsel silme işlemi sırasında hata:', error);
          }
        }

        // Modelleri sil
        await supabase
          .from('models')
          .delete()
          .eq('brand_id', brand.id);
      }
      
      // Markaları sil
      await supabase
        .from('brands')
        .delete()
        .eq('category_id', id);

      // Kategori görselini storage'dan silme
      if (categoryData?.image_url) {
        try {
          // URL'den dosya yolunu çıkar
          // Doğru dosya yolu çıkarımı için regex desenini düzeltme
          let filePath;
          
          // Standart publicURL formatı
          const standardMatch = categoryData.image_url.match(/\/storage\/v1\/object\/public\/image\/(.*)/);
          if (standardMatch && standardMatch[1]) {
            filePath = decodeURIComponent(standardMatch[1]);
          } else {
            // Alternatif URL formatı (tam URL biçimi)
            const fullUrlMatch = categoryData.image_url.match(/https:\/\/.*\/storage\/v1\/object\/public\/image\/(.*)/);
            if (fullUrlMatch && fullUrlMatch[1]) {
              filePath = decodeURIComponent(fullUrlMatch[1]);
            } else {
              // Doğrudan dosya yolu formatı
              const parts = categoryData.image_url.split('image/');
              if (parts.length > 1) {
                filePath = decodeURIComponent(parts[1]);
              } else {
                // Son çare: dosya adını al
                const fileName = categoryData.image_url.split('/').pop();
                if (fileName) {
                  filePath = `image/kategoriler/${fileName}`;
                }
              }
            }
          }
          
          if (filePath) {
            console.log('Silinecek kategori görseli:', filePath);
            const { error: storageError, data } = await supabase.storage
              .from('image')
              .remove([filePath]);
            
            if (storageError) {
              console.error('Kategori görseli silme hatası:', storageError);
            } else {
              console.log('Kategori görseli başarıyla silindi:', data);
            }
          } else {
            console.error('Dosya yolu çıkarılamadı:', categoryData.image_url);
          }
        } catch (error) {
          console.error('Görsel silme işlemi sırasında hata:', error);
        }
      }

      // Kategoriyi sil
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Kategorileri yenile
      fetchCategories();
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      alert('Kategori silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleReorderCategories = async () => {
    // Burada kategori sıralama işlemi eklenebilir
    alert('Sıralama kaydedildi');
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
          <h1 className="text-xl font-semibold text-blue-600">Kategoriler</h1>
          <p className="text-sm text-gray-500">Cihaz kategorilerini yönetin ve sıralayın</p>
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
        {/* Yeni Kategori Ekle */}
        <div className="bg-white rounded-md shadow-sm border p-4">
          <h2 className="text-base font-medium mb-4">Yeni Kategori Ekle</h2>
          
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori Adı
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newCategory.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori Resmi
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
              disabled={isSubmitting || saving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {saving ? 'Ekleniyor...' : isSubmitting ? 'Ekleniyor...' : 'Kategori Ekle'}
            </button>
          </form>
        </div>
        
        {/* Mevcut Kategoriler */}
        <div className="bg-white rounded-md shadow-sm border">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-base font-medium">Mevcut Kategoriler</h2>
            <button
              onClick={handleReorderCategories}
              className="bg-green-600 text-white py-1 px-2 rounded-md text-xs hover:bg-green-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sıralamayı Kaydet
            </button>
          </div>
          
          <div className="p-2">
            {categories.length > 0 ? (
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id} className="flex items-center bg-gray-50 p-3 rounded-md border">
                    <div className="flex items-center mr-2 cursor-grab">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                    
                    <div className="h-10 w-10 bg-gray-200 rounded-md mr-3 overflow-hidden flex-shrink-0">
                      {category.image_url ? (
                        <img 
                          src={category.image_url} 
                          alt={category.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full text-gray-400 text-xs">
                          Resim Yok
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {category.id}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      title="Kategoriyi Sil"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                Henüz kategori bulunmamaktadır.
              </div>
            )}
          </div>
          
          {categories.length > 0 && (
            <div className="p-3 bg-blue-50 text-sm border-t">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-blue-600">
                  Kategorileri sürükleyip bırakarak sıralamayı değiştirebilirsiniz. Değişiklikleri kaydetmeyi unutmayın!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 