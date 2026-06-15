import type { Metadata } from "next";
import VideoStudio from "@/components/video/VideoStudio";

export const metadata: Metadata = {
  title: "AI Anlatım Videosu — 2D Animasyonlu Video Üretici | İzletiriz",
  description:
    "Bir konu yaz; AI senaryo, seslendirme ve 2D animasyonlarla 15 dakikaya kadar anlatım videosu üret ve .webm olarak indir.",
};

export default function VideoPage() {
  return <VideoStudio />;
}
