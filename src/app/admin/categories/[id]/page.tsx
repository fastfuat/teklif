'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditCategory({ params }: PageProps) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', image_url: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setCategory(data);
        setFormData({
          name: data.name,
          image_url: data.image_url || '',
        });
      } catch (error) {
        console.error('Error fetching category:', error);
        setError('Kategori bulunamadı.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Kategori adı zorunludur.');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('categories')
        .update({ 
          name: formData.name,
          image_url: formData.image_url || null
        })
        .eq('id', params.id);
      
      if (error) {
        throw error;
      }
      
      router.push('/admin/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Kategori güncellenirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Kategori yükleniyor...</p>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600 mb-4">{error}</div>
        <Link 
          href="/admin/categories" 
          className="text-blue-600 hover:underline"
        >
          Kategorilere Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Kategori Düzenle</h2>
        <Link 
          href="/admin/categories" 
          className="text-blue-600 hover:underline"
        >
          Kategorilere Dön
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Kategori Adı
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
            Resim URL (Opsiyonel)
          </label>
          <input
            type="text"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          
          <Link
            href="/admin/categories"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}