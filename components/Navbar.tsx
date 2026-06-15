"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CaveManLogo from "./CaveManLogo";
import { searchMovies } from "@/lib/movies";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReturnType<typeof searchMovies>>([]);
  const [showResults, setShowResults] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setShowResults(false); return; }
    const found = searchMovies(query);
    setResults(found.slice(0, 5));
    setShowResults(true);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/ara?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
      setQuery("");
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={scrolled ? {} : { background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)" }}
    >
      <div className={scrolled ? "glass" : ""}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <CaveManLogo size={44} />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" style={{ background: "#e50914" }} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight" style={{ color: "#e50914" }}>
                İZLE
              </span>
              <span className="text-xl font-black tracking-tight text-white">TİRİZ</span>
              <div className="text-[9px] text-gray-500 tracking-widest uppercase leading-none">
                HD · 4K · Online
              </div>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Ana Sayfa", href: "/" },
              { label: "Filmler", href: "/kategori" },
              { label: "Aksiyon", href: "/kategori?genre=Aksiyon" },
              { label: "Komedi", href: "/kategori?genre=Komedi" },
              { label: "Dram", href: "/kategori?genre=Dram" },
              { label: "🎨 Thumbnail", href: "/thumbnail" },
              { label: "🎬 Video", href: "/video" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="search-input"
                placeholder="Film, yönetmen ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setShowResults(true)}
              />
            </form>

            {/* Dropdown results */}
            {showResults && results.length > 0 && (
              <div className="absolute top-full mt-2 right-0 w-80 rounded-lg overflow-hidden shadow-2xl z-50"
                style={{ background: "#16161f", border: "1px solid #2a2a3a" }}>
                {results.map((m) => (
                  <Link
                    key={m.id}
                    href={`/film/${m.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                    onClick={() => { setShowResults(false); setQuery(""); }}
                  >
                    <img
                      src={m.poster}
                      alt={m.titleTR}
                      className="w-10 h-14 object-cover rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">{m.titleTR}</div>
                      <div className="text-xs text-gray-500">{m.year} · {m.genres[0]}</div>
                    </div>
                    <div className="ml-auto text-xs text-yellow-400">★ {m.rating}</div>
                  </Link>
                ))}
                <Link
                  href={`/ara?q=${encodeURIComponent(query)}`}
                  className="block px-4 py-2.5 text-center text-sm text-red-400 hover:bg-white/5 border-t border-white/5"
                  onClick={() => { setShowResults(false); setQuery(""); }}
                >
                  Tüm sonuçları gör →
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu btn */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenu
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden px-4 pb-4 space-y-1" style={{ background: "rgba(10,10,15,0.98)" }}>
            {[
              { label: "Ana Sayfa", href: "/" },
              { label: "Filmler", href: "/kategori" },
              { label: "Aksiyon", href: "/kategori?genre=Aksiyon" },
              { label: "Komedi", href: "/kategori?genre=Komedi" },
              { label: "Dram", href: "/kategori?genre=Dram" },
              { label: "🎨 Thumbnail Stüdyo", href: "/thumbnail" },
              { label: "🎬 AI Video", href: "/video" },
              { label: "Ara", href: "/ara" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-gray-300 hover:text-white rounded-md hover:bg-white/5"
                onClick={() => setMobileMenu(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
