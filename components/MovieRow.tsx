import Link from "next/link";
import { Movie } from "@/lib/movies";
import MovieCard from "./MovieCard";

type Props = {
  title: string;
  movies: Movie[];
  viewAllHref?: string;
};

export default function MovieRow({ title, movies, viewAllHref }: Props) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5 px-4 md:px-0">
        <h2 className="section-title">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            Tümünü Gör
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4 md:px-0">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
