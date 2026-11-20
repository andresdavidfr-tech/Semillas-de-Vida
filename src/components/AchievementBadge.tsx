import React from 'react';
import { AchievementIconKey, MedalTier } from '../data/achievements';

interface AchievementBadgeProps {
  iconKey: AchievementIconKey;
  tier: MedalTier;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const TIER_PALETTE: Record<
  MedalTier,
  { ring: string; fill: string; ribbon: string; stroke: string }
> = {
  bronze: {
    ring: 'from-orange-100 to-amber-200 border-amber-500',
    fill: '#D97706',
    ribbon: '#B45309',
    stroke: '#78350F',
  },
  silver: {
    ring: 'from-slate-100 to-slate-200 border-slate-400',
    fill: '#94A3B8',
    ribbon: '#475569',
    stroke: '#334155',
  },
  gold: {
    ring: 'from-yellow-100 to-amber-300 border-amber-500',
    fill: '#F59E0B',
    ribbon: '#15803D',
    stroke: '#92400E',
  },
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  iconKey,
  tier,
  unlocked,
  size = 'md',
}) => {
  const palette = TIER_PALETTE[tier];
  const boxSize =
    size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';
  const svgSize =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';

  return (
    <div
      className={`${boxSize} rounded-2xl border-2 flex items-center justify-center shrink-0 transition-transform duration-200 ${
        unlocked
          ? `bg-gradient-to-br ${palette.ring} shadow-sm`
          : 'bg-stone-100 border-stone-200 grayscale opacity-55'
      }`}
    >
      <svg
        viewBox="0 0 48 48"
        className={svgSize}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Ribbon */}
        <path d="M16 5H23L21 15H15L16 5Z" fill={palette.ribbon} />
        <path d="M25 5H32L33 15H27L25 5Z" fill={palette.ribbon} opacity="0.85" />
        {/* Medal Disc */}
        <circle
          cx="24"
          cy="27"
          r="15"
          fill="#FFFBEB"
          stroke={palette.stroke}
          strokeWidth="2.5"
        />
        <circle cx="24" cy="27" r="11.5" fill={palette.fill} opacity="0.22" />

        {iconKey === 'sprout' && (
          <>
            <path d="M24 35V24" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
            <path
              d="M24 27C19 26 17 22 18 19C22 19 24 22 24 27Z"
              fill="#22C55E"
              stroke="#15803D"
              strokeWidth="1.6"
            />
            <path
              d="M24 25C29 24 31 20 30 17C26 17 24 20 24 25Z"
              fill="#4ADE80"
              stroke="#15803D"
              strokeWidth="1.6"
            />
          </>
        )}

        {iconKey === 'silver-medal' && (
          <path
            d="M24 18L26.8 23.8L33 24.7L28.5 29L29.6 35.2L24 32.2L18.4 35.2L19.5 29L15 24.7L21.2 23.8L24 18Z"
            fill="#64748B"
            stroke="#334155"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        )}

        {iconKey === 'compass' && (
          <>
            <circle cx="24" cy="27" r="8.5" stroke="#1B4332" strokeWidth="2" fill="#FFFFFF" />
            <path d="M24 20L27 27L24 34L21 27L24 20Z" fill="#EF4444" />
            <circle cx="24" cy="27" r="1.8" fill="#1B4332" />
          </>
        )}

        {iconKey === 'gold-crown' && (
          <path
            d="M16 32L17.5 22L21.5 26L24 20L26.5 26L30.5 22L32 32H16Z"
            fill="#F59E0B"
            stroke="#92400E"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        )}

        {iconKey === 'stars' && (
          <>
            <path
              d="M24 18L25.8 22.5L30.5 23L27 26.2L28 31L24 28.5L20 31L21 26.2L17.5 23L22.2 22.5L24 18Z"
              fill="#FBBF24"
              stroke="#B45309"
              strokeWidth="1.6"
            />
            <circle cx="17" cy="31" r="2" fill="#F59E0B" />
            <circle cx="31" cy="31" r="2" fill="#F59E0B" />
          </>
        )}

        {iconKey === 'bullseye' && (
          <>
            <circle cx="24" cy="27" r="8" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2.5" />
            <circle cx="24" cy="27" r="4" fill="#EF4444" />
            <circle cx="24" cy="27" r="1.5" fill="#FFFFFF" />
          </>
        )}

        {iconKey === 'seeds' && (
          <>
            <ellipse cx="20" cy="28" rx="3" ry="4.5" transform="rotate(-15 20 28)" fill="#D97706" />
            <ellipse cx="28" cy="28" rx="3" ry="4.5" transform="rotate(15 28 28)" fill="#F59E0B" />
            <ellipse cx="24" cy="24" rx="3" ry="4.5" fill="#B45309" />
          </>
        )}

        {iconKey === 'palette' && (
          <>
            <path
              d="M24 19C18.5 19 15 23 15 27.5C15 31.5 18 34.5 22 34.5C24 34.5 25 33.2 25 32C25 30.8 26.2 30 27.5 30H29.5C31.8 30 33 28.2 33 26C33 21.8 29.2 19 24 19Z"
              fill="#FEF3C7"
              stroke="#92400E"
              strokeWidth="1.8"
            />
            <circle cx="19.5" cy="26" r="1.6" fill="#EF4444" />
            <circle cx="22.5" cy="23" r="1.6" fill="#3B82F6" />
            <circle cx="27" cy="23.5" r="1.6" fill="#22C55E" />
          </>
        )}
      </svg>
    </div>
  );
};
