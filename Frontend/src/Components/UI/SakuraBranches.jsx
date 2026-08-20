import React, { useId } from "react";

/** Pétale de sakura (5 lobes) — forme organique */
function SakuraFlower({ cx, cy, r = 14, rotation = 0, opacity = 1, delay = 0 }) {
  const petals = [0, 72, 144, 216, 288].map((angle) => {
    const rad = ((angle + rotation) * Math.PI) / 180;
    const px = cx + Math.cos(rad) * r * 0.55;
    const py = cy + Math.sin(rad) * r * 0.55;
    return (
      <ellipse
        key={angle}
        cx={px}
        cy={py}
        rx={r * 0.48}
        ry={r * 0.42}
        fill="#f5b4be"
        transform={`rotate(${angle + rotation} ${px} ${py})`}
      />
    );
  });

  return (
    <g className="sakura-bloom" opacity={opacity} style={{ animationDelay: `${delay}s` }}>
      {petals}
      <ellipse cx={cx} cy={cy} rx={r * 0.22} ry={r * 0.2} fill="#fce4ec" opacity="0.6" />
      <circle cx={cx} cy={cy} r={r * 0.14} fill="#f7e6b8" />
      <circle cx={cx - 1} cy={cy - 1} r={r * 0.05} fill="#fff8e7" opacity="0.8" />
    </g>
  );
}

function SakuraBud({ cx, cy, r = 5, opacity = 0.7 }) {
  return (
    <g opacity={opacity}>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 1.1} fill="#f8cdd3" />
      <ellipse cx={cx - 1} cy={cy - 1} rx={r * 0.5} ry={r * 0.55} fill="#fce8ec" />
    </g>
  );
}

/** Branches de sakura décoratives — rendu plus naturel */
function SakuraBranch({ side = "left", className = "" }) {
  const uid = useId().replace(/:/g, "");
  const branchGradId = `branchGrad-${uid}`;
  const twigGradId = `twigGrad-${uid}`;
  const flipTransform = side === "right" ? "scale(-1, 1) translate(-320, 0)" : undefined;

  return (
    <svg
      className={className}
      viewBox="0 0 320 560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={branchGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a3528" />
          <stop offset="50%" stopColor="#5c4038" />
          <stop offset="100%" stopColor="#3d2a22" />
        </linearGradient>
        <linearGradient id={twigGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5c4038" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#6b4c3b" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <g transform={flipTransform}>

      {/* Tronc / branche principale — courbes organiques */}
      <path
        d="M38 8 C52 60, 44 110, 58 165 C72 220, 55 275, 68 330 C78 375, 88 420, 105 470 C118 510, 135 540, 158 560"
        stroke={`url(#${branchGradId})`}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M38 8 C52 60, 44 110, 58 165 C72 220, 55 275, 68 330 C78 375, 88 420, 105 470 C118 510, 135 540, 158 560"
        stroke="#3d2a22"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
        transform="translate(2, 1)"
      />

      {/* Rameaux secondaires */}
      <path
        d="M58 165 C95 148, 138 132, 178 108 C210 92, 238 78, 265 62"
        stroke={`url(#${twigGradId})`}
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M68 330 C108 312, 148 298, 188 278 C218 264, 248 248, 278 228"
        stroke={`url(#${twigGradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M55 275 C88 258, 118 248, 148 228"
        stroke={`url(#${twigGradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      <path
        d="M88 420 C118 405, 148 395, 178 378"
        stroke={`url(#${twigGradId})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />
      <path
        d="M58 165 C42 148, 28 128, 18 108"
        stroke={`url(#${twigGradId})`}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />

      {/* Feuilles brunes (bourgeons) */}
      <ellipse cx="248" cy="248" rx="6" ry="3" fill="#6b5344" opacity="0.45" transform="rotate(-25 248 248)" />
      <ellipse cx="128" cy="242" rx="5" ry="2.5" fill="#6b5344" opacity="0.4" transform="rotate(15 128 242)" />
      <ellipse cx="198" cy="382" rx="5" ry="2.5" fill="#6b5344" opacity="0.35" transform="rotate(-10 198 382)" />

      {/* Fleurs — grappes naturelles le long des rameaux */}
      <SakuraFlower cx={265} cy={62} r={16} rotation={-12} opacity={0.95} delay={0} />
      <SakuraFlower cx={248} cy={78} r={11} rotation={18} opacity={0.82} delay={0.3} />
      <SakuraFlower cx={278} cy={88} r={9} rotation={-8} opacity={0.75} delay={0.5} />

      <SakuraFlower cx={178} cy={108} r={15} rotation={8} opacity={0.92} delay={0.2} />
      <SakuraFlower cx={158} cy={122} r={10} rotation={-15} opacity={0.78} delay={0.6} />
      <SakuraBud cx={198} cy={98} r={4.5} />

      <SakuraFlower cx={278} cy={228} r={14} rotation={-5} opacity={0.9} delay={0.4} />
      <SakuraFlower cx={258} cy={242} r={11} rotation={22} opacity={0.8} delay={0.7} />
      <SakuraFlower cx={298} cy={238} r={8} rotation={-18} opacity={0.7} delay={0.9} />

      <SakuraFlower cx={188} cy={278} r={13} rotation={12} opacity={0.88} delay={0.1} />
      <SakuraFlower cx={168} cy={292} r={9} rotation={-10} opacity={0.72} delay={0.55} />

      <SakuraFlower cx={148} cy={228} r={10} rotation={5} opacity={0.8} delay={0.35} />
      <SakuraBud cx={132} cy={218} r={4} />

      <SakuraFlower cx={105} cy={470} r={12} rotation={-8} opacity={0.85} delay={0.45} />
      <SakuraFlower cx={88} cy={458} r={8} rotation={14} opacity={0.68} delay={0.8} />

      <SakuraFlower cx={68} cy={330} r={9} rotation={-20} opacity={0.72} delay={0.25} />
      <SakuraBud cx={52} cy={318} r={3.5} opacity={0.6} />

      <SakuraFlower cx={42} cy={148} r={8} rotation={10} opacity={0.65} delay={0.65} />
      <SakuraBud cx={28} cy={128} r={3} opacity={0.55} />

      {/* Pétales tombés / détails */}
      <ellipse cx={220} cy={145} rx={3} ry={2.5} fill="#f5b4be" opacity="0.5" transform="rotate(40 220 145)" />
      <ellipse cx={115} cy={395} rx={2.5} ry={2} fill="#f8cdd3" opacity="0.45" transform="rotate(-20 115 395)" />
      </g>
    </svg>
  );
}

function FallingPetals() {
  const petals = [
    { left: "8%", delay: "0s", duration: "18s", size: 11 },
    { left: "18%", delay: "3s", duration: "22s", size: 8 },
    { left: "28%", delay: "1.5s", duration: "20s", size: 12 },
    { left: "40%", delay: "5s", duration: "19s", size: 9 },
    { left: "52%", delay: "2s", duration: "21s", size: 10 },
    { left: "62%", delay: "6s", duration: "17s", size: 8 },
    { left: "72%", delay: "0.8s", duration: "23s", size: 11 },
    { left: "82%", delay: "4s", duration: "20s", size: 9 },
    { left: "90%", delay: "2.8s", duration: "18s", size: 13 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {petals.map((p, i) => (
        <span
          key={i}
          className="sakura-petal absolute top-[-5%]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 0.85,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

export { SakuraBranch, FallingPetals };
