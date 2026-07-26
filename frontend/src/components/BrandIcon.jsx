export function BrandIcon({ className = "", size = 38 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      aria-hidden="true"
      style={{ borderRadius: "11px 11px 11px 3px", overflow: "hidden" }}
    >
      <defs>
        <linearGradient id="biBg" x1="160" y1="110" x2="860" y2="910" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#613252"/>
          <stop offset="0.45" stopColor="#49243e"/>
          <stop offset="1" stopColor="#24111f"/>
        </linearGradient>
        <radialGradient id="biGlow" cx="50%" cy="32%" r="72%">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".14"/>
          <stop offset=".55" stopColor="#ffffff" stopOpacity=".02"/>
          <stop offset="1" stopColor="#000000" stopOpacity=".22"/>
        </radialGradient>
        <linearGradient id="biGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c9"/>
          <stop offset=".28" stopColor="#e7c27d"/>
          <stop offset=".58" stopColor="#b47a34"/>
          <stop offset=".82" stopColor="#f0d39a"/>
          <stop offset="1" stopColor="#8d5a22"/>
        </linearGradient>
      </defs>
      <rect x="44" y="44" width="936" height="936" rx="218" fill="url(#biBg)"/>
      <rect x="44" y="44" width="936" height="936" rx="218" fill="url(#biGlow)"/>
      <g filter="url(#biShadow)">
        <path d="M258 362C258 319 293 284 336 284H722C773 284 815 326 815 377V738C815 789 773 831 722 831H330C281 831 241 791 241 742V391C241 375 247 365 258 362Z"
              fill="#49243e" stroke="#8b5674" strokeWidth="4"/>
        <rect x="228" y="403" width="598" height="438" rx="82"
              fill="#3d1f35" stroke="#94607b" strokeWidth="5"/>
        <circle cx="703" cy="322" r="78" fill="url(#biGold)" stroke="#fff0c3" strokeWidth="4"/>
        <g transform="translate(521 629)">
          <ellipse cx="0" cy="8" rx="50" ry="50" fill="url(#biGold)" stroke="#8b5927" strokeWidth="5"/>
          <path d="M0 20C-3 55-8 82-20 100" stroke="url(#biGold)" strokeWidth="16" strokeLinecap="round"/>
        </g>
      </g>
      <rect x="44" y="44" width="936" height="936" rx="218"
            fill="none" stroke="url(#biGold)" strokeWidth="6"/>
      <defs>
        <filter id="biShadow">
          <feDropShadow dx="0" dy="20" stdDeviation="16" floodColor="#140a12" floodOpacity=".3"/>
        </filter>
      </defs>
    </svg>
  );
}
