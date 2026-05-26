import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <div className="text-8xl font-black mb-4" style={{ color: "#e50914" }}>404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Sayfa Bulunamadı</h1>
        <p className="text-gray-500 mb-8">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        <Link href="/" className="play-btn inline-flex">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
