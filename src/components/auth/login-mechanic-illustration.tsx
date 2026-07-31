'use client';

function MechanicDefs() {
  return (
    <defs>
      <linearGradient id="mechFace" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" className="login-mech-stop-a" />
        <stop offset="30%" className="login-mech-stop-b" />
        <stop offset="65%" className="login-mech-stop-c" />
        <stop offset="100%" className="login-mech-stop-d" />
      </linearGradient>
      <linearGradient id="mechEdge" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id="mechBevel" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" className="login-mech-bevel-top" />
        <stop offset="100%" className="login-mech-bevel-bottom" />
      </linearGradient>
      <filter id="mechGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#3b82f6" floodOpacity="0.22" />
      </filter>
    </defs>
  );
}

export function MechanicIllustration() {
  return (
    <div className="login-mechanic-wrap shrink-0" aria-hidden>
      <svg viewBox="0 0 120 72" className="login-mechanic-svg h-[4.25rem] w-[6.75rem] sm:h-[4.75rem] sm:w-[7.5rem]">
        <MechanicDefs />

        <g filter="url(#mechGlow)">
          <ellipse cx="62" cy="66" rx="48" ry="4" className="login-mechanic-ground" />

          <g className="login-mechanic-car">
            <path
              d="M 52 44 L 58 36 L 72 32 L 96 32 L 108 38 L 112 44 L 112 50 L 52 50 Z"
              fill="url(#mechFace)"
              className="login-mech-stroke"
              strokeWidth="0.8"
            />
            <path
              d="M 58 44 L 64 37 L 78 34 L 94 34 L 104 39 L 108 44"
              fill="none"
              className="login-mech-highlight"
              strokeWidth="1"
            />
            <path
              d="M 64 37 L 72 33 L 88 33 L 96 37 L 96 42 L 64 42 Z"
              fill="url(#mechBevel)"
              opacity="0.9"
            />
            <circle cx="98" cy="50" r="7" className="login-mech-wheel-tire" />
            <circle cx="98" cy="50" r="5" fill="url(#mechFace)" className="login-mech-wheel-rim" strokeWidth="0.6" />
            <g className="login-mechanic-wheel">
              <line x1="98" y1="46" x2="98" y2="54" className="login-mech-spoke" strokeWidth="0.8" />
              <line x1="94" y1="50" x2="102" y2="50" className="login-mech-spoke" strokeWidth="0.8" />
            </g>
          </g>

          <g className="login-mechanic-person">
            <circle cx="24" cy="22" r="8" fill="url(#mechFace)" className="login-mech-stroke" strokeWidth="0.6" />
            <circle cx="22" cy="20" r="2.5" className="login-mech-head-highlight" />
            <path
              d="M 16 30 Q 14 42 18 52 L 30 52 Q 34 42 32 30 Z"
              fill="url(#mechFace)"
              className="login-mech-stroke"
              strokeWidth="0.6"
            />
            <path d="M 18 36 L 30 36" stroke="url(#mechEdge)" strokeWidth="1.2" opacity="0.7" />
            <path
              d="M 20 52 L 18 62 M 28 52 L 30 62"
              className="login-mech-legs"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          <g className="login-mechanic-arm">
            <path
              d="M 28 34 L 48 40 L 46 44 L 30 40 Z"
              fill="url(#mechFace)"
              className="login-mech-stroke"
              strokeWidth="0.5"
            />
            <g transform="translate(46, 38) rotate(-25)">
              <rect x="-2" y="0" width="4" height="14" rx="1" fill="url(#mechFace)" className="login-mech-stroke" strokeWidth="0.5" />
              <path d="M -6 -4 L 6 -4 L 4 2 L -4 2 Z" fill="url(#mechBevel)" className="login-mech-stroke" strokeWidth="0.5" />
              <line x1="-5" y1="-4" x2="5" y2="-4" className="login-mech-highlight" strokeWidth="0.8" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
