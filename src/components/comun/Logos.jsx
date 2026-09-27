// Logotipos propios y ficticios, dibujados en SVG. No imitan ninguna marca real.

export function LogoTodoenvio({ alto = 30, claro = false, className = '' }) {
  const tinta = claro ? '#ffffff' : '#1b2a41'
  return (
    <svg viewBox="0 0 176 40" height={alto} className={className} role="img" aria-label="Todoenvío">
      {/* Caja con un rayo de velocidad */}
      <g transform="translate(2 4)">
        <path d="M16 0 L31 7 L31 25 L16 32 L1 25 L1 7 Z" fill="#f39c12" />
        <path d="M16 0 L31 7 L16 14 L1 7 Z" fill="#f7b955" />
        <path d="M16 14 L16 32 L1 25 L1 7 Z" fill="#d9820b" />
        <path d="M20 13 L14 21 L18 21 L15 28 L23 18 L19 18 L22 13 Z" fill="#1b2a41" />
      </g>
      <text x="40" y="28" fontFamily="'Segoe UI', Arial, sans-serif" fontWeight="800" fontSize="25" fill={tinta} letterSpacing="-0.5">
        todoenvío
      </text>
      <circle cx="166" cy="26" r="3.2" fill="#f39c12" />
    </svg>
  )
}

export function LogoGalerias({ alto = 34, claro = false, className = '' }) {
  const tinta = claro ? '#ffffff' : '#111111'
  return (
    <svg viewBox="0 0 200 44" height={alto} className={className} role="img" aria-label="Galerías Olmo">
      {/* Olmo estilizado */}
      <g transform="translate(2 2)">
        <circle cx="20" cy="20" r="19" fill={claro ? '#ffffff' : '#0b7a3e'} />
        <path d="M20 8 C28 8 31 15 29 19 C33 21 31 28 25 27 C23 30 17 30 15 27 C9 28 7 21 11 19 C9 15 12 8 20 8 Z" fill={claro ? '#0b7a3e' : '#ffffff'} />
        <path d="M20 22 L20 34 M20 26 L16 23 M20 25 L24 22" stroke={claro ? '#0b7a3e' : '#ffffff'} strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <text x="48" y="21" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize="17" fill={tinta}>
        Galerías
      </text>
      <text x="48" y="40" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="21" letterSpacing="3" fill={tinta}>
        OLMO
      </text>
    </svg>
  )
}
