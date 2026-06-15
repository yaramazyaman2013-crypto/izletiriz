import type { Metadata } from "next";
import Studio from "@/components/thumbnail/Studio";

export const metadata: Metadata = {
  title: "Thumbnail Stüdyo — Viral YouTube Kapak Üretici | İzletiriz",
  description:
    "Ücretsiz viral YouTube thumbnail üretici. Kalın outline'lı başlıklar, emoji, ok ve şekiller, AI arka plan ve tek tıkla 1280×720 PNG indirme.",
};

export default function ThumbnailPage() {
  return <Studio />;
}
