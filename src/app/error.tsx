'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h2 className="text-4xl font-bold mb-4">Hata</h2>
        <h1 className="text-2xl font-semibold mb-4">Bir sorun oluştu</h1>
        <p className="text-gray-600 mb-8">
          İşleminiz sırasında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <div className="flex space-x-4 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
} 