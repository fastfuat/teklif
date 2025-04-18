export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <h2 className="text-xl font-semibold mt-4">Yükleniyor...</h2>
        <p className="text-gray-500 mt-2">Lütfen bekleyin</p>
      </div>
    </div>
  );
} 