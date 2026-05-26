"use client";

export default function ScrollToPlayerBtn() {
  return (
    <button
      className="play-btn pulse-glow"
      onClick={() => {
        const el = document.getElementById("video-player");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
      Şimdi İzle
    </button>
  );
}
