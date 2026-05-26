import { notFound } from "next/navigation";
import Link from "next/link";
import { getMovieById, movies } from "@/lib/movies";
import MovieCard from "@/components/MovieCard";
import ScrollToPlayerBtn from "@/components/ScrollToPlayerBtn";

export async function generateStaticParams() {
  return movies.map((m) => ({ id: m.id }));
}

export default async function FilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = getMovieById(id);
  if (!movie) notFound();

  const related = movies
    .filter((m) => m.id !== movie.id && m.genres.some((g) => movie.genres.includes(g)))
    .slice(0, 6);

  const qualityClass =
    movie.quality === "4K" ? "badge-4k" :
    movie.quality === "CAM" ? "badge-cam" : "badge-hd";

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative w-full" style={{ height: "55vh", minHeight: 340 }}>
        <img
          src={movie.backdrop}
          alt={movie.titleTR}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 20%" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.85) 70%, #0a0a0f 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,10,15,0.8) 0%, transparent 60%)" }} />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-40 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Poster */}
          <div className="shrink-0">
            <div className="w-48 md:w-56 rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/10">
              <img src={movie.poster} alt={movie.titleTR} className="w-full h-auto" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`badge ${qualityClass}`}>{movie.quality}</span>
              {movie.isNew && <span className="badge badge-new">YENİ</span>}
              {movie.isTop && <span className="badge badge-top">TOP</span>}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white mb-1 leading-tight">
              {movie.titleTR}
            </h1>
            {movie.title !== movie.titleTR && (
              <p className="text-gray-500 text-sm mb-4">{movie.title}</p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 mb-5 text-sm">
              <div className="flex items-center gap-1.5">
                <span style={{ background: "#f5c518", color: "#000" }} className="font-bold px-1.5 py-0.5 rounded text-xs">
                  IMDb
                </span>
                <span className="text-yellow-400 font-bold">{movie.rating}</span>
                <span className="text-gray-500">/ 10</span>
                <span className="text-gray-600">({movie.votes})</span>
              </div>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">{movie.year}</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">{movie.duration}</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">{movie.country}</span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-5">
              {movie.genres.map((g) => (
                <Link key={g} href={`/kategori?genre=${g}`} className="genre-chip text-xs">
                  {g}
                </Link>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-2xl">
              {movie.description}
            </p>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-500 w-24 shrink-0">Yönetmen</span>
                <span className="text-gray-200">{movie.director}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-24 shrink-0">Dil</span>
                <span className="text-gray-200">{movie.language}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-24 shrink-0">Oyuncular</span>
                <span className="text-gray-200">{movie.cast.slice(0, 3).join(", ")}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-24 shrink-0">Süre</span>
                <span className="text-gray-200">{movie.duration}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <ScrollToPlayerBtn />
              <a
                href={`https://www.youtube.com/watch?v=${movie.trailer}`}
                target="_blank"
                rel="noopener noreferrer"
                className="info-btn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                Fragman İzle
              </a>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div id="video-player" className="mt-12">
          <h2 className="section-title mb-5">Film İzle</h2>

          {/* Player options */}
          <div className="flex gap-3 mb-4 flex-wrap">
            {["Türkçe Dublaj", "Türkçe Altyazı", "Orijinal"].map((opt, i) => (
              <button
                key={opt}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  i === 0
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
                style={i === 0
                  ? { background: "#e50914", border: "1px solid #e50914" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }
                }
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Embed player — YouTube trailer as demo */}
          <div className="video-container" style={{ borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailer}?autoplay=0&rel=0&modestbranding=1`}
              title={movie.titleTR}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Info box */}
          <div className="mt-4 px-4 py-3 rounded-lg text-sm text-gray-500 flex items-center gap-2"
            style={{ background: "rgba(229,9,20,0.08)", border: "1px solid rgba(229,9,20,0.2)" }}>
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Film yükleniyor... Alternatif sunucu seçmek için yukarıdaki seçeneklere tıklayın.
          </div>
        </div>

        {/* Related Movies */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="section-title mb-6">Benzer Filmler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {related.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
