import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h2 className="text-4xl font-bold mb-4">404</h2>
        <h1 className="text-2xl font-semibold mb-4">Sayfa Bulunamadı</h1>
        <p className="text-gray-600 mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
} 