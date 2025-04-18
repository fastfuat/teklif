import React from 'react';
import Link from 'next/link';
import { Brand, Category } from '@/types';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

async function getCategory(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }
  
  return data;
}

async function getBrandsByCategory(categoryId: string): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('category_id', categoryId)
    .order('name');
  
  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
  
  return data || [];
}

export default async function CategoryPage({ params }: PageProps) {
  const category = await getCategory(params.id);
  
  if (!category) {
    notFound();
  }
  
  const brands = await getBrandsByCategory(params.id);

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-5xl">
        <nav className="flex mb-8 text-sm">
          <Link href="/" className="text-blue-600 hover:underline">
            Ana Sayfa
          </Link>
          <span className="mx-2">/</span>
          <span>{category.name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-8">{category.name} - Marka Seçimi</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {brands.length > 0 ? (
            brands.map((brand) => (
              <Link 
                key={brand.id} 
                href={`/quote/brand/${brand.id}?categoryId=${category.id}`}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  {brand.image_url ? (
                    <img 
                      src={brand.image_url} 
                      alt={brand.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">{brand.name}</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-medium">{brand.name}</h3>
                </div>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Bu kategoride henüz marka bulunmamaktadır. Admin panelinden markalar ekleyebilirsiniz.
            </p>
          )}
        </div>
      </div>
    </main>
  );
} 