import { SVGProps } from 'react';

type SvgProps = SVGProps<SVGSVGElement>;

/** Cancha de fútbol top-down con franjas de siega e iluminación de estadio. */
export function CampoSVG(props: SvgProps) {
    return (
        <svg viewBox="0 0 1400 500" preserveAspectRatio="xMidYMid slice" {...props}>
            <defs>
                <radialGradient
                    id="haCampoLight" cx="50%" cy="50%" r="55%"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(700,250) scale(700,300) translate(-1,-1)"
                >
                    <stop offset="0%"   stopColor="#1f7a33" />
                    <stop offset="45%"  stopColor="#175e28" />
                    <stop offset="100%" stopColor="#0a2d10" />
                </radialGradient>
                <radialGradient id="haCampoVignette" cx="50%" cy="50%" r="70%">
                    <stop offset="40%"  stopColor="transparent" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
                </radialGradient>
            </defs>

            {/* Base */}
            <rect width="1400" height="500" fill="#0d3a16" />

            {/* Franjas de siega */}
            <rect x="0"    y="0" width="140" height="500" fill="#114d1e" />
            <rect x="280"  y="0" width="140" height="500" fill="#114d1e" />
            <rect x="560"  y="0" width="140" height="500" fill="#114d1e" />
            <rect x="840"  y="0" width="140" height="500" fill="#114d1e" />
            <rect x="1120" y="0" width="140" height="500" fill="#114d1e" />

            {/* Iluminación radial de estadio */}
            <ellipse cx="700" cy="250" rx="620" ry="310" fill="url(#haCampoLight)" />
            <rect width="1400" height="500" fill="url(#haCampoVignette)" />

            {/* ── Líneas de campo ── */}
            <rect x="70" y="25" width="1260" height="450"
                fill="none" stroke="rgba(255,255,255,0.70)" strokeWidth="3" />
            <line x1="700" y1="25" x2="700" y2="475"
                stroke="rgba(255,255,255,0.70)" strokeWidth="2.5" />
            <circle cx="700" cy="250" r="88"
                fill="none" stroke="rgba(255,255,255,0.68)" strokeWidth="2.5" />
            <circle cx="700" cy="250" r="5" fill="rgba(255,255,255,0.80)" />

            {/* Área penal izquierda */}
            <rect x="70" y="155" width="185" height="190"
                fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" />
            <rect x="70" y="198" width="72" height="104"
                fill="none" stroke="rgba(255,255,255,0.60)" strokeWidth="2" />
            <circle cx="190" cy="250" r="4" fill="rgba(255,255,255,0.75)" />
            <path d="M 255 201 A 90 90 0 0 1 255 299"
                fill="none" stroke="rgba(255,255,255,0.58)" strokeWidth="2" />

            {/* Área penal derecha */}
            <rect x="1145" y="155" width="185" height="190"
                fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" />
            <rect x="1258" y="198" width="72" height="104"
                fill="none" stroke="rgba(255,255,255,0.60)" strokeWidth="2" />
            <circle cx="1210" cy="250" r="4" fill="rgba(255,255,255,0.75)" />
            <path d="M 1145 201 A 90 90 0 0 0 1145 299"
                fill="none" stroke="rgba(255,255,255,0.58)" strokeWidth="2" />

            {/* Arcos de esquina */}
            <path d="M 70  48  A 22 22 0 0 0 92  25"  fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth="2" />
            <path d="M 1330 25  A 22 22 0 0 0 1308 48" fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth="2" />
            <path d="M 70  452 A 22 22 0 0 1 92  475" fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth="2" />
            <path d="M 1330 475 A 22 22 0 0 1 1308 452" fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth="2" />
        </svg>
    );
}

/**
 * Balón de fútbol clásico blanco y negro.
 * Pentágonos = negro. Hexágonos = esfera blanca visible (solo bordes).
 * Geometría derivada del icosaedro truncado proyectado.
 */
export function BalonSVG(props: SvgProps) {
    return (
        <svg viewBox="0 0 200 200" {...props}>
            <defs>
                {/* Gradiente esférico: blanco brillante arriba-izq, gris en bordes */}
                <radialGradient id="haBalonBase" cx="36%" cy="30%" r="65%">
                    <stop offset="0%"   stopColor="#ffffff" />
                    <stop offset="40%"  stopColor="#ececec" />
                    <stop offset="100%" stopColor="#a8a8a8" />
                </radialGradient>
                {/* Oscurecimiento de borde para dar forma esférica */}
                <radialGradient id="haBalonEdge" cx="50%" cy="50%" r="50%">
                    <stop offset="60%"  stopColor="transparent" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
                </radialGradient>
                {/* Sombreado interior de paneles negros (realismo 3D) */}
                <radialGradient id="haPentShadow" cx="36%" cy="30%" r="65%">
                    <stop offset="0%"   stopColor="rgba(80,80,80,0.0)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
                </radialGradient>
                <filter id="haBalonShadow" x="-22%" y="-22%" width="144%" height="144%">
                    <feDropShadow dx="5" dy="10" stdDeviation="10" floodColor="rgba(0,0,0,0.55)" />
                </filter>
                <clipPath id="haBalonClip">
                    <circle cx="100" cy="100" r="90" />
                </clipPath>
            </defs>

            {/* Sombra de suelo */}
            <ellipse cx="104" cy="193" rx="60" ry="9" fill="rgba(0,0,0,0.28)" />

            {/* ── 1. Esfera blanca base ── */}
            <circle cx="100" cy="100" r="90" fill="url(#haBalonBase)" filter="url(#haBalonShadow)" />

            {/* ── 2. Pentágonos NEGROS (con sutil shading esférico) ── */}
            <g clipPath="url(#haBalonClip)" strokeLinejoin="round" strokeWidth="1.4" stroke="#111">
                {/* Pentágono central */}
                <polygon points="100,39 120,53 113,77 88,77 80,53" fill="#1a1a1a" />
                {/* Pentágono sup-der (entre hex sup-der y hex derecho) */}
                <polygon points="143,45 160,65 174,50 170,26 150,16" fill="#1a1a1a" />
                {/* Pentágono der-inf (entre hex derecho y hex inferior) */}
                <polygon points="128,96 152,90 163,114 144,130 120,122" fill="#1a1a1a" />
                {/* Pentágono inf-izq (entre hex inferior y hex izquierdo) */}
                <polygon points="73,98 87,120 76,144 52,140 40,117"  fill="#1a1a1a" />
                {/* Pentágono izq-sup (entre hex izq y hex sup-izq) */}
                <polygon points="56,45 39,66 18,62 16,38 36,22"      fill="#1a1a1a" />
                {/* Pentágono sup (entre hex sup-izq y hex sup-der) — mayormente fuera */}
                <polygon points="101,14 125,3 131,-14 108,-20 85,-8"  fill="#1a1a1a" />
            </g>

            {/* ── 3. Bordes de hexágonos (solo trazos, sin relleno — muestra la esfera blanca) ── */}
            <g fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeLinejoin="round" clipPath="url(#haBalonClip)">
                {/* Hex sup-der  (arista A-B del pentágono central) */}
                <polygon points="100,39 120,53 143,45 146,18 125,3 101,14" />
                {/* Hex derecho  (arista B-C) */}
                <polygon points="120,53 113,77 128,96 152,90 160,65 143,45" />
                {/* Hex inferior (arista C-D) */}
                <polygon points="113,77 88,77 73,98 87,120 112,120 128,96" />
                {/* Hex izquierdo (arista D-E) */}
                <polygon points="88,77 80,53 56,45 39,66 46,90 73,98" />
                {/* Hex sup-izq  (arista E-A) */}
                <polygon points="80,53 100,39 101,14 78,3 56,17 56,45" />
            </g>

            {/* ── 4. Capa de profundidad esférica (oscurece bordes uniformemente) ── */}
            <circle cx="100" cy="100" r="90" fill="url(#haBalonEdge)" clipPath="url(#haBalonClip)" />

            {/* ── 5. Reflejo de luz (specular highlight) ── */}
            <ellipse cx="66" cy="52" rx="18" ry="12"
                fill="rgba(255,255,255,0.65)" transform="rotate(-35 66 52)" />
            <ellipse cx="54" cy="68" rx="7" ry="4"
                fill="rgba(255,255,255,0.30)" transform="rotate(-35 54 68)" />
        </svg>
    );
}
