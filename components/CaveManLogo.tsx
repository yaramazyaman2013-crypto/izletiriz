"use client";

export default function CaveManLogo({ size = 42 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body / club (hide behind head) */}
      {/* Club */}
      <g transform="rotate(-30, 68, 70)">
        <rect x="64" y="52" width="8" height="28" rx="4" fill="#8B6914" />
        <ellipse cx="68" cy="50" rx="10" ry="8" fill="#A07820" />
        <ellipse cx="68" cy="50" rx="7" ry="5" fill="#8B6914" />
      </g>

      {/* Primitive clothing / skin */}
      {/* Body */}
      <ellipse cx="46" cy="72" rx="16" ry="18" fill="#C8956A" />
      {/* Fur/skins clothing */}
      <path d="M33 68 Q38 58 46 60 Q54 58 59 68 Q62 78 55 82 Q46 86 37 82 Q30 78 33 68Z" fill="#6B4423" />
      <path d="M38 60 Q46 54 54 60 L52 64 Q46 58 40 64Z" fill="#8B5E3C" />

      {/* Neck */}
      <rect x="42" y="52" width="8" height="10" rx="3" fill="#C8956A" />

      {/* Head */}
      <ellipse cx="46" cy="42" rx="18" ry="20" fill="#C8956A" />

      {/* Messy hair */}
      <path d="M28 32 Q30 18 36 16 Q38 12 44 14 Q48 10 54 14 Q60 16 63 24 Q66 30 64 36" stroke="#3D2000" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M28 32 Q26 20 32 16 Q34 10 42 12" stroke="#3D2000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M64 34 Q68 24 62 16 Q58 10 52 12" stroke="#3D2000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Hair fill top */}
      <ellipse cx="46" cy="24" rx="18" ry="12" fill="#3D2000" />
      <ellipse cx="46" cy="28" rx="16" ry="10" fill="#3D2000" />

      {/* 3D Cinema Glasses */}
      {/* Frame bar */}
      <rect x="25" y="39" width="42" height="3" rx="1.5" fill="#222" />
      {/* Left lens - RED */}
      <rect x="24" y="39" width="18" height="13" rx="5" fill="#ff2233" opacity="0.85" />
      <rect x="24" y="39" width="18" height="13" rx="5" fill="none" stroke="#111" strokeWidth="1.5" />
      {/* Lens shine */}
      <path d="M27 41 Q30 40 34 42" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Right lens - CYAN */}
      <rect x="44" y="39" width="18" height="13" rx="5" fill="#00ccff" opacity="0.85" />
      <rect x="44" y="39" width="18" height="13" rx="5" fill="none" stroke="#111" strokeWidth="1.5" />
      {/* Lens shine */}
      <path d="M47 41 Q50 40 54 42" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Nose bridge center clip */}
      <rect x="41" y="41" width="4" height="7" rx="1" fill="#333" />

      {/* Temple arms */}
      <line x1="24" y1="42" x2="18" y2="44" stroke="#222" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="62" y1="42" x2="68" y2="44" stroke="#222" strokeWidth="2.5" strokeLinecap="round" />

      {/* Mouth - big grin */}
      <path d="M37 56 Q46 62 55 56" stroke="#7A4010" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Teeth */}
      <path d="M40 57 Q46 63 52 57" fill="white" stroke="#ccc" strokeWidth="0.5" />

      {/* Left arm */}
      <path d="M30 70 Q20 76 22 84" stroke="#C8956A" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* Right arm (holding club) */}
      <path d="M62 68 Q74 64 72 56" stroke="#C8956A" strokeWidth="7" strokeLinecap="round" fill="none" />

      {/* Legs */}
      <path d="M38 86 Q36 96 34 100" stroke="#6B4423" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M52 86 Q54 96 56 100" stroke="#6B4423" strokeWidth="7" strokeLinecap="round" fill="none" />
    </svg>
  );
}
