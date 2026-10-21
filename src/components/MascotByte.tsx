import React from 'react';

export type MascotMood = 'happy' | 'curious' | 'celebrating' | 'thinking' | 'idle';

interface MascotByteProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isFloating?: boolean;
}

export const MascotByte: React.FC<MascotByteProps> = ({
  mood = 'idle',
  size = 'md',
  className = '',
  isFloating = false,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${sizeMap[size]} ${
        isFloating ? 'animate-bounce' : ''
      } ${className}`}
      style={{ animationDuration: isFloating ? '3.5s' : undefined }}
      aria-label={`Byte the coding robot (${mood} expression)`}
      role="img"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Antenna */}
        <line x1="50" y1="20" x2="50" y2="10" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" />
        <circle
          cx="50"
          cy="8"
          r="5"
          fill="#38BDF8"
          className="animate-pulse"
          style={{ filter: 'drop-shadow(0 0 4px #38BDF8)' }}
        />

        {/* Robot Ears / Bolts */}
        <rect x="18" y="38" width="6" height="12" rx="3" fill="#6366F1" />
        <rect x="76" y="38" width="6" height="12" rx="3" fill="#6366F1" />

        {/* Head Base */}
        <rect
          x="22"
          y="20"
          width="56"
          height="48"
          rx="14"
          fill="url(#robot-gradient)"
          stroke="#4F46E5"
          strokeWidth="2.5"
        />

        {/* Visor Screen */}
        <rect
          x="28"
          y="28"
          width="44"
          height="28"
          rx="8"
          fill="#0F172A"
          stroke="#1E293B"
          strokeWidth="1.5"
        />

        {/* Visor Glare */}
        <path
          d="M 32 32 L 68 32"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Robot Eyes based on Mood */}
        {mood === 'celebrating' ? (
          <>
            {/* Happy arch eyes (^^) */}
            <path
              d="M 36 43 Q 41 36 46 43"
              stroke="#FBBF24"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 54 43 Q 59 36 64 43"
              stroke="#FBBF24"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Cheerful blush */}
            <circle cx="34" cy="48" r="2.5" fill="#F43F5E" opacity="0.75" />
            <circle cx="66" cy="48" r="2.5" fill="#F43F5E" opacity="0.75" />
          </>
        ) : mood === 'thinking' ? (
          <>
            {/* Thinking eyes: one eye squinted, one open */}
            <circle cx="41" cy="41" r="3.5" fill="#38BDF8" />
            <line x1="56" y1="41" x2="64" y2="41" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
            {/* Curious mouth */}
            <circle cx="50" cy="48" r="2" fill="#38BDF8" opacity="0.8" />
          </>
        ) : mood === 'curious' ? (
          <>
            <circle cx="41" cy="40" r="4.5" fill="#38BDF8" />
            <circle cx="59" cy="40" r="4.5" fill="#38BDF8" />
            <circle cx="42" cy="38.5" r="1.5" fill="#FFFFFF" />
            <circle cx="60" cy="38.5" r="1.5" fill="#FFFFFF" />
            <line x1="47" y1="48" x2="53" y2="48" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Default / Happy glowing cyan eyes */}
            <rect x="37" y="37" width="8" height="8" rx="3" fill="#38BDF8" />
            <rect x="55" y="37" width="8" height="8" rx="3" fill="#38BDF8" />
            {/* Eye reflections */}
            <rect x="39" y="38" width="2.5" height="2.5" rx="1" fill="#FFFFFF" />
            <rect x="57" y="38" width="2.5" height="2.5" rx="1" fill="#FFFFFF" />
            {/* Small smile */}
            <path
              d="M 45 49 Q 50 53 55 49"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Cheerful blush */}
            <circle cx="34" cy="47" r="2" fill="#818CF8" opacity="0.6" />
            <circle cx="66" cy="47" r="2" fill="#818CF8" opacity="0.6" />
          </>
        )}

        {/* Neck */}
        <rect x="45" y="68" width="10" height="5" rx="1.5" fill="#4338CA" />

        {/* Body Base */}
        <path
          d="M 30 73 L 70 73 C 74 73 78 77 77 82 L 74 94 C 73 97 70 99 66 99 L 34 99 C 30 99 27 97 26 94 L 23 82 C 22 77 26 73 30 73 Z"
          fill="url(#robot-body-gradient)"
          stroke="#4F46E5"
          strokeWidth="2.5"
        />

        {/* Core Heart / Power Indicator */}
        <circle cx="50" cy="85" r="5" fill="#F59E0B" opacity="0.9" />
        <circle cx="50" cy="85" r="2" fill="#FEF3C7" />
        <path
          d="M 44 85 L 56 85"
          stroke="#D97706"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="robot-gradient" x1="22" y1="20" x2="78" y2="68" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4338CA" />
            <stop offset="1" stopColor="#312E81" />
          </linearGradient>
          <linearGradient id="robot-body-gradient" x1="23" y1="73" x2="77" y2="99" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3730A3" />
            <stop offset="1" stopColor="#1E1B4B" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
