import Link from "next/link";
import { Movie } from "@/lib/movies";

export default function MovieCard({ movie }: { movie: Movie }) {
  const qualityClass =
    movie.quality === "4K" ? "badge-4k" :
    movie.quality === "CAM" ? "badge-cam" : "badge-hd";

  return (
    <Link href={`/film/${movie.id}`} className="block">
      <div className="card-hover rounded-lg overflow-hidden cursor-pointer group"
        style={{ background: "#16161f" }}>
        {/* Poster */}
        <div className="relative" style={{ paddingTop: "148%" }}>
          <img
            src={movie.poster}
            alt={movie.titleTR}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(229,9,20,0.9)" }}>
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className={`badge ${qualityClass}`}>{movie.quality}</span>
            {movie.isNew && <span className="badge badge-new">YENİ</span>}
            {movie.isTop && <span className="badge badge-top">TOP</span>}
          </div>

          {/* Rating */}
          <div className="absolute bottom-2 right-2">
            <span className="imdb-star text-xs font-bold px-1.5 py-0.5 rounded"
              style={{ background: "#f5c518", color: "#000" }}>
              ★ {movie.rating}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight mb-1 group-hover:text-red-400 transition-colors">
            {movie.titleTR}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{movie.year}</span>
            <span>·</span>
            <span>{movie.duration}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {movie.genres.slice(0, 2).map((g) => (
              <span key={g} className="tag-pill">{g}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
