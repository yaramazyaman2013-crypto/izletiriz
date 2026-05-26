"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { movies, genres, getMoviesByGenre } from "@/lib/movies";
import MovieCard from "@/components/MovieCard";

function KategoriContent() {
  const searchParams = useSearchParams();
  const genreParam = searchParams.get("genre");
  const filterParam = searchParams.get("filter");

  const [activeGenre, setActiveGenre] = useState(genreParam || "Tümü");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    if (genreParam) setActiveGenre(genreParam);
  }, [genreParam]);

  let filtered = getMoviesByGenre(activeGenre);

  if (filterParam === "new") filtered = movies.filter((m) => m.isNew);
  else if (filterParam === "top") filtered = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 10);

  if (sort === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  else if (sort === "year") filtered = [...filtered].sort((a, b) => b.year - a.year);
  else if (sort === "title") filtered = [...filtered].sort((a, b) => a.titleTR.localeCompare(b.titleTR));

  const pageTitle = filterParam === "new"
    ? "Yeni Çıkanlar"
    : filterParam === "top"
    ? "En Çok Beğenilenler"
    : activeGenre === "Tümü"
    ? "Tüm Filmler"
    : activeGenre;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">{pageTitle}</h1>
        <p className="text-gray-500 text-sm">{filtered.length} film bulundu</p>
      </div>

      {/* Genre chips */}
      {!filterParam && (
        <div className="flex flex-wrap gap-2 mb-8">
          {genres.map((g) => (
            <button
              key={g}
              className={`genre-chip${activeGenre === g ? " active" : ""}`}
              onClick={() => setActiveGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Sort */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-gray-500 text-sm">Sırala:</span>
        {[
          { val: "default", label: "Varsayılan" },
          { val: "rating", label: "IMDb Puanı" },
          { val: "year", label: "Yıl" },
          { val: "title", label: "İsim" },
        ].map((s) => (
          <button
            key={s.val}
            onClick={() => setSort(s.val)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={sort === s.val
              ? { background: "#e50914", color: "#fff" }
              : { background: "rgba(255,255,255,0.06)", color: "#888", border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          <p className="text-lg font-medium text-gray-600">Bu kategoride film bulunamadı</p>
        </div>
      )}
    </div>
  );
}

export default function KategoriPage() {
  return (
    <Suspense>
      <KategoriContent />
    </Suspense>
  );
}
