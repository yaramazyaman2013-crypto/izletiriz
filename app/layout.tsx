import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "İzletiriz – HD Film İzle | 4K Kalite Türkçe",
  description: "En yeni filmleri HD ve 4K kalitesinde ücretsiz izleyin. Türkçe dublaj ve altyazı seçenekleriyle binlerce film.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
