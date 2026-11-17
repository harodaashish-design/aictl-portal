export default function AicteEmblem({ className = 'h-16 w-16' }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="AICTE Academic Portal Emblem"
    >
      <defs>
        <linearGradient id="aicteRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B2C6F" />
          <stop offset="100%" stopColor="#1A4FA3" />
        </linearGradient>
      </defs>
      {/* Outer decorative gear/sunburst ring */}
      <circle cx="60" cy="60" r="56" fill="#FFFFFF" stroke="#0B2C6F" strokeWidth="3" />
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        stroke="#F37021"
        strokeWidth="2.5"
        strokeDasharray="6 3"
      />
      <circle cx="60" cy="60" r="44" fill="url(#aicteRing)" />
      {/* Inner engineering gear & open book */}
      <circle cx="60" cy="54" r="22" fill="#FFFFFF" fillOpacity="0.14" stroke="#F8FAFC" strokeWidth="1.5" />
      {/* Open Book */}
      <path
        d="M34 68 C43 63, 53 64, 60 69 C67 64, 77 63, 86 68 L86 81 C77 77, 67 78, 60 83 C53 78, 43 77, 34 81 Z"
        fill="#FFFFFF"
      />
      <line x1="60" y1="69" x2="60" y2="83" stroke="#0B2C6F" strokeWidth="2" />
      {/* Torch / Lamp of Knowledge */}
      <path d="M60 27 C64 33, 65 39, 60 44 C55 39, 56 33, 60 27 Z" fill="#F37021" />
      <rect x="57" y="44" width="6" height="16" rx="2" fill="#FBBF24" />
      <path d="M46 53 L74 53" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      {/* Bottom curved banner */}
      <path d="M24 91 Q60 104 96 91" fill="none" stroke="#F37021" strokeWidth="3" />
      <text
        x="60"
        y="102"
        textAnchor="middle"
        fill="#0B2C6F"
        fontSize="10.5"
        fontWeight="800"
        letterSpacing="1.2"
      >
        AICTE
      </text>
    </svg>
  );
}
