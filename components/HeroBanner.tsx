import Link from "next/link";
import { Movie } from "@/lib/movies";

export default function HeroBanner({ movie }: { movie: Movie }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: "85vh", minHeight: 500 }}>
      {/* Backdrop */}
      <img
        src={movie.backdrop}
        alt={movie.titleTR}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center top" }}
      />

      {/* Gradients */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute bottom-0 left-0 right-0 h-40 hero-bottom" />
      <div className="absolute top-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to bottom, rgba(10,10,15,0.6) 0%, transparent 100%)" }} />

      {/* Content */}
      <div className="absolute inset-0 flex items-end pb-20 px-6 md:px-16 max-w-7xl mx-auto left-0 right-0">
        <div className="max-w-xl fade-in">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className="badge badge-4k">{movie.quality}</span>
            {movie.isNew && <span className="badge badge-new">YENİ</span>}
            <span className="px-2 py-1 text-xs font-medium rounded"
              style={{ background: "rgba(245,197,24,0.2)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.3)" }}>
              ★ {movie.rating} / 10
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight drop-shadow-lg">
            {movie.titleTR}
          </h1>
          {movie.title !== movie.titleTR && (
            <p className="text-gray-400 text-sm mb-3">{movie.title}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-400">
            <span>{movie.year}</span>
            <span>·</span>
            <span>{movie.duration}</span>
            <span>·</span>
            <span>{movie.language}</span>
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
          <p className="text-gray-300 text-sm leading-relaxed mb-7 line-clamp-3 max-w-lg">
            {movie.description}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <Link href={`/film/${movie.id}`} className="play-btn pulse-glow">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Şimdi İzle
            </Link>
            <Link href={`/film/${movie.id}`} className="info-btn">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Detaylar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
