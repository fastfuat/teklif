'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categoryCount: 0,
    brandCount: 0,
    modelCount: 0,
    featureCount: 0,
    quoteCount: 0,
  });
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch counts
        const [
          { count: categoryCount }, 
          { count: brandCount }, 
          { count: modelCount },
          { count: featureCount },
          { count: quoteCount }
        ] = await Promise.all([
          supabase.from('categories').select('*', { count: 'exact', head: true }),
          supabase.from('brands').select('*', { count: 'exact', head: true }),
          supabase.from('models').select('*', { count: 'exact', head: true }),
          supabase.from('features').select('*', { count: 'exact', head: true }),
          supabase.from('quotes').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          categoryCount: categoryCount || 0,
          brandCount: brandCount || 0,
          modelCount: modelCount || 0,
          featureCount: featureCount || 0,
          quoteCount: quoteCount || 0,
        });

        const { data: quotes } = await supabase
          .from('quotes')
          .select(`
            *,
            categories:category_id(name),
            brands:brand_id(name),
            models:model_id(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentQuotes(quotes || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const menuCards = [
    {
      title: 'KATEGORİLER',
      description: 'Kategorileri yönet',
      link: '/admin/categories',
      count: stats.categoryCount,
      color: 'bg-blue-600'
    },
    {
      title: 'MARKALAR',
      description: 'Markaları yönet',
      link: '/admin/brands',
      count: stats.brandCount,
      color: 'bg-blue-600'
    },
    {
      title: 'MODELLER',
      description: 'Modelleri yönet',
      link: '/admin/models',
      count: stats.modelCount,
      color: 'bg-blue-600'
    },
    {
      title: 'DURUM SEÇENEKLERİ',
      description: 'Durum seçeneklerini yönet',
      link: '/admin/features',
      count: stats.featureCount,
      color: 'bg-blue-600'
    },
    {
      title: 'CİHAZ ÖZELLİKLERİ',
      description: 'Özellikleri yönet',
      link: '/admin/features',
      count: stats.featureCount,
      color: 'bg-blue-600'
    },
    {
      title: 'AYARLAR',
      description: 'Ayarları yönet',
      link: '/admin/settings',
      count: null,
      color: 'bg-blue-600'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
        <div className="flex items-start">
          <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
            <span className="text-yellow-600 text-sm">ⓘ</span>
          </div>
          <p className="text-sm text-gray-600">
            Bu panel üzerinden cihaz kategori, marka, model ve özelliklerini yönetebilirsiniz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {menuCards.map((card, index) => (
          <Link key={index} href={card.link} className="block hover:no-underline">
            <div className={`${card.color} rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200`}>
              <div className="p-3 text-white">
                <h3 className="text-sm font-semibold">{card.title}</h3>
                <p className="text-blue-100 text-xs mt-1">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {recentQuotes.length > 0 && (
        <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold">Son Teklifler</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marka
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">{quote.id}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">
                        {quote.categories?.name || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">
                        {quote.brands?.name || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">
                        {quote.models?.name || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">
                        {new Date(quote.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 