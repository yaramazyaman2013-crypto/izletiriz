"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchMovies } from "@/lib/movies";
import MovieCard from "@/components/MovieCard";

function AraContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(searchMovies(initialQuery));

  useEffect(() => {
    setResults(searchMovies(query));
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/ara?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
      {/* Search form */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white mb-6">Film Ara</h1>
        <form onSubmit={handleSubmit} className="relative max-w-xl">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 rounded-xl text-base outline-none transition-all"
            style={{
              background: "#16161f",
              border: "1px solid #2a2a3a",
              color: "#fff",
            }}
            placeholder="Film adı, yönetmen veya tür ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </form>
      </div>

      {/* Results */}
      {query.trim().length > 0 ? (
        <>
          <p className="text-gray-500 text-sm mb-6">
            <span className="text-white font-medium">&quot;{query}&quot;</span> için{" "}
            <span className="text-red-400">{results.length}</span> sonuç bulundu
          </p>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 text-lg">Sonuç bulunamadı</p>
              <p className="text-gray-600 text-sm mt-2">Farklı bir arama terimi deneyin</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-600">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg">Aramak istediğiniz filmi yazın</p>
        </div>
      )}
    </div>
  );
}

export default function AraPage() {
  return (
    <Suspense>
      <AraContent />
    </Suspense>
  );
}
