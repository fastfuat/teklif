import React from 'react';
import Link from 'next/link';
import { Brand, Category, Model } from '@/types';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    categoryId: string;
  };
}

async function getBrand(id: string): Promise<Brand | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching brand:', error);
    return null;
  }
  
  return data;
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

async function getModelsByBrand(brandId: string): Promise<Model[]> {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('brand_id', brandId)
    .order('name');
  
  if (error) {
    console.error('Error fetching models:', error);
    return [];
  }
  
  return data || [];
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const brand = await getBrand(params.id);
  
  if (!brand) {
    notFound();
  }
  
  const category = await getCategory(searchParams.categoryId);
  
  if (!category) {
    notFound();
  }
  
  const models = await getModelsByBrand(params.id);

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-5xl">
        <nav className="flex mb-8 text-sm">
          <Link href="/" className="text-blue-600 hover:underline">
            Ana Sayfa
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/quote/category/${category.id}`} className="text-blue-600 hover:underline">
            {category.name}
          </Link>
          <span className="mx-2">/</span>
          <span>{brand.name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-8">{brand.name} - Model Seçimi</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {models.length > 0 ? (
            models.map((model) => (
              <Link 
                key={model.id} 
                href={`/quote/model/${model.id}?categoryId=${category.id}&brandId=${brand.id}`}
                className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="text-xl font-medium">{model.name}</h3>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Bu markada henüz model bulunmamaktadır. Admin panelinden modeller ekleyebilirsiniz.
            </p>
          )}
        </div>
      </div>
    </main>
  );
} 