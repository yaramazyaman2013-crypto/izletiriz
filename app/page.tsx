"use client";

import { useState } from "react";
import { movies, genres, getFeaturedMovie, getTopRated, getNewReleases, getMoviesByGenre } from "@/lib/movies";
import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import MovieCard from "@/components/MovieCard";

export default function Home() {
  const featured = getFeaturedMovie();
  const topRated = getTopRated();
  const newReleases = getNewReleases();
  const [activeGenre, setActiveGenre] = useState("Tümü");

  const filteredMovies = getMoviesByGenre(activeGenre);

  return (
    <>
      {/* Hero */}
      <HeroBanner movie={featured} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-4 relative z-10">

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-lg">
          {[
            { num: movies.length + "+", label: "Film" },
            { num: "4K", label: "Kalite" },
            { num: "TR", label: "Dublaj" },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-lg" style={{ background: "#16161f", border: "1px solid #2a2a3a" }}>
              <div className="text-xl font-black" style={{ color: "#e50914" }}>{s.num}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Yeni Çıkanlar */}
        <MovieRow
          title="Yeni Çıkanlar"
          movies={newReleases}
          viewAllHref="/kategori?filter=new"
        />

        {/* Top Rated */}
        <MovieRow
          title="En Çok Beğenilenler"
          movies={topRated}
          viewAllHref="/kategori?filter=top"
        />

        {/* Genre filter section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Kategoriye Göre</h2>
          </div>

          {/* Genre chips */}
          <div className="flex flex-wrap gap-2 mb-6">
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

          {/* Movies grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {filteredMovies.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <p>Bu kategoride film bulunamadı</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
