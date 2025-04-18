import React from 'react';
import Link from 'next/link';
import { Brand, Category, Feature, Model } from '@/types';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import QuoteForm from '@/components/QuoteForm';

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    categoryId: string;
    brandId: string;
  };
}

async function getModel(id: string): Promise<Model | null> {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching model:', error);
    return null;
  }
  
  return data;
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

async function getFeaturesByModel(modelId: string): Promise<Feature[]> {
  const { data, error } = await supabase
    .from('features')
    .select('*')
    .eq('model_id', modelId)
    .order('name');
  
  if (error) {
    console.error('Error fetching features:', error);
    return [];
  }
  
  return data || [];
}

export default async function ModelPage({ params, searchParams }: PageProps) {
  const model = await getModel(params.id);
  
  if (!model) {
    notFound();
  }
  
  const brand = await getBrand(searchParams.brandId);
  
  if (!brand) {
    notFound();
  }
  
  const category = await getCategory(searchParams.categoryId);
  
  if (!category) {
    notFound();
  }
  
  const features = await getFeaturesByModel(params.id);

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
          <Link href={`/quote/brand/${brand.id}?categoryId=${category.id}`} className="text-blue-600 hover:underline">
            {brand.name}
          </Link>
          <span className="mx-2">/</span>
          <span>{model.name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-8">{model.name} - Özellik Seçimi</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <QuoteForm 
            features={features}
            category={category}
            brand={brand}
            model={model}
          />
        </div>
      </div>
    </main>
  );
} 