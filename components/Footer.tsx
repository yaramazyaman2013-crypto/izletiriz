import Link from "next/link";
import CaveManLogo from "./CaveManLogo";

export default function Footer() {
  return (
    <footer style={{ background: "#0d0d14", borderTop: "1px solid #1a1a2a" }} className="mt-16 pt-12 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <CaveManLogo size={40} />
              <div>
                <span className="text-2xl font-black" style={{ color: "#e50914" }}>İZLE</span>
                <span className="text-2xl font-black text-white">TİRİZ</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              En yeni ve en iyi filmleri HD ve 4K kalitesinde ücretsiz izleyin.
              Türkçe dublaj ve altyazı seçenekleriyle.
            </p>
            <div className="flex gap-3 mt-4">
              {["HD", "4K", "TR"].map((tag) => (
                <span key={tag} className="badge badge-hd">{tag}</span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Kategoriler</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {["Aksiyon", "Komedi", "Dram", "Gerilim", "Animasyon", "Bilim Kurgu"].map((g) => (
                <li key={g}>
                  <Link href={`/kategori?genre=${g}`} className="hover:text-red-400 transition-colors">
                    {g}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Site</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {[
                { label: "Ana Sayfa", href: "/" },
                { label: "Tüm Filmler", href: "/kategori" },
                { label: "Arama", href: "/ara" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-red-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1a1a2a" }} className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © 2024 İzletiriz · Tüm hakları saklıdır
          </p>
          <p className="text-gray-600 text-xs flex items-center gap-1">
            <span>🎬</span> Mağara adamı gibi izle, modern adam gibi eğlen
          </p>
        </div>
      </div>
    </footer>
  );
}
