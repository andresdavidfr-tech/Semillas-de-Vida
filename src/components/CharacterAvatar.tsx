import React from 'react';
import { CharacterId } from '../data/characters';

export type AvatarMood = 'idle' | 'speaking' | 'cheering' | 'encouraging';

interface CharacterAvatarProps {
  characterId: CharacterId;
  mood?: AvatarMood;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  characterId,
  mood = 'idle',
  size = 'md',
}) => {
  const sizeClass =
    size === 'xs'
      ? 'w-10 h-10'
      : size === 'sm'
      ? 'w-14 h-14'
      : size === 'lg'
      ? 'w-24 h-24'
      : 'w-16 h-16';

  const motionClass =
    mood === 'cheering'
      ? 'animate-bounce'
      : mood === 'speaking'
      ? 'scale-105'
      : 'animate-float-slow';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-200 ${sizeClass} ${motionClass}`}
    >
      {/* Joyful sparkles when cheering */}
      {mood === 'cheering' && (
        <svg
          viewBox="0 0 80 80"
          className="absolute -inset-2 w-[125%] h-[125%] pointer-events-none"
          aria-hidden="true"
        >
          <path d="M12 18L14 12L16 18L22 20L16 22L14 28L12 22L6 20Z" fill="#F59E0B" />
          <path d="M66 14L67.5 10L69 14L73 15.5L69 17L67.5 21L66 17L62 15.5Z" fill="#10B981" />
          <circle cx="68" cy="58" r="3" fill="#FBBF24" />
          <circle cx="10" cy="54" r="2.5" fill="#34D399" />
        </svg>
      )}

      {/* Sound wave arcs when speaking */}
      {mood === 'speaking' && (
        <svg
          viewBox="0 0 80 80"
          className="absolute -right-2 top-0 w-7 h-7 pointer-events-none animate-pulse"
          aria-hidden="true"
        >
          <path
            d="M24 30C29 34 29 46 24 50"
            stroke="#059669"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M34 23C42 30 42 50 34 57"
            stroke="#F59E0B"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      )}

      <svg
        viewBox="0 0 80 80"
        className="w-full h-full drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {characterId === 'lamb' && (
          <>
            {/* Fluffy wool body/ears */}
            <circle cx="20" cy="34" r="9" fill="#FEF3C7" stroke="#78350F" strokeWidth="2.5" />
            <circle cx="60" cy="34" r="9" fill="#FEF3C7" stroke="#78350F" strokeWidth="2.5" />
            {/* Wool puff crown */}
            <circle cx="30" cy="20" r="10" fill="#FFFBEB" stroke="#78350F" strokeWidth="2" />
            <circle cx="40" cy="17" r="11" fill="#FFFBEB" stroke="#78350F" strokeWidth="2" />
            <circle cx="50" cy="20" r="10" fill="#FFFBEB" stroke="#78350F" strokeWidth="2" />
            {/* Face */}
            <ellipse cx="40" cy="43" rx="20" ry="18" fill="#FDE68A" stroke="#78350F" strokeWidth="2.5" />
            {/* Rosy cheeks */}
            <circle cx="27" cy="46" r="3.5" fill="#FCA5A5" opacity="0.7" />
            <circle cx="53" cy="46" r="3.5" fill="#FCA5A5" opacity="0.7" />
            {/* Eyes */}
            <circle cx="32" cy="39" r="3.2" fill="#1A2E22" />
            <circle cx="48" cy="39" r="3.2" fill="#1A2E22" />
            <circle cx="33" cy="38" r="1" fill="#FFFFFF" />
            <circle cx="49" cy="38" r="1" fill="#FFFFFF" />
            {/* Nose & Smile / Speaking mouth */}
            <path d="M37 45L40 48L43 45" stroke="#78350F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {mood === 'speaking' ? (
              <ellipse cx="40" cy="52" rx="4" ry="3.5" fill="#991B1B" />
            ) : (
              <path
                d={mood === 'cheering' ? 'M34 50C36 55 44 55 46 50' : 'M35 50C37.5 53 42.5 53 45 50'}
                stroke="#78350F"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )}
            {/* Shepherd green ribbon bow */}
            <path d="M32 63L40 60L48 63L45 69L40 66L35 69Z" fill="#16A34A" stroke="#14532D" strokeWidth="1.8" />
          </>
        )}

        {characterId === 'dove' && (
          <>
            {/* Wings */}
            <path
              d={
                mood === 'cheering'
                  ? 'M18 40C8 24 14 14 26 24L28 42Z'
                  : 'M20 44C10 38 12 24 26 30L28 48Z'
              }
              fill="#BAE6FD"
              stroke="#0369A1"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d={
                mood === 'cheering'
                  ? 'M62 40C72 24 66 14 54 24L52 42Z'
                  : 'M60 44C70 38 68 24 54 30L52 48Z'
              }
              fill="#BAE6FD"
              stroke="#0369A1"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Body & Head */}
            <circle cx="40" cy="40" r="21" fill="#F0F9FF" stroke="#0369A1" strokeWidth="2.5" />
            {/* Little crest feather */}
            <path d="M38 19C38 12 45 11 45 19" fill="#E0F2FE" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" />
            {/* Cheeks */}
            <circle cx="27" cy="43" r="3.5" fill="#FDA4AF" opacity="0.7" />
            <circle cx="53" cy="43" r="3.5" fill="#FDA4AF" opacity="0.7" />
            {/* Eyes */}
            <circle cx="32" cy="36" r="3.2" fill="#0C4A6E" />
            <circle cx="48" cy="36" r="3.2" fill="#0C4A6E" />
            <circle cx="33" cy="35" r="1" fill="#FFFFFF" />
            <circle cx="49" cy="35" r="1" fill="#FFFFFF" />
            {/* Beak */}
            {mood === 'speaking' ? (
              <ellipse cx="40" cy="44" rx="4.5" ry="3.8" fill="#F59E0B" stroke="#B45309" strokeWidth="1.8" />
            ) : (
              <path d="M35 42L40 48L45 42Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.8" strokeLinejoin="round" />
            )}
            {/* Olive leaf */}
            <path d="M46 47C52 45 58 49 56 54C50 55 46 51 46 47Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.6" />
          </>
        )}

        {characterId === 'lion' && (
          <>
            {/* Soft golden mane */}
            <circle cx="40" cy="40" r="27" fill="#D97706" stroke="#78350F" strokeWidth="2.5" />
            {/* Ears */}
            <circle cx="21" cy="21" r="7" fill="#FBBF24" stroke="#78350F" strokeWidth="2.5" />
            <circle cx="59" cy="21" r="7" fill="#FBBF24" stroke="#78350F" strokeWidth="2.5" />
            {/* Face */}
            <circle cx="40" cy="42" r="19" fill="#FDE047" stroke="#78350F" strokeWidth="2.5" />
            {/* Cheeks */}
            <circle cx="27" cy="45" r="3.5" fill="#FB7185" opacity="0.55" />
            <circle cx="53" cy="45" r="3.5" fill="#FB7185" opacity="0.55" />
            {/* Eyes */}
            <circle cx="33" cy="38" r="3.2" fill="#451A03" />
            <circle cx="47" cy="38" r="3.2" fill="#451A03" />
            <circle cx="34" cy="37" r="1" fill="#FFFFFF" />
            <circle cx="48" cy="37" r="1" fill="#FFFFFF" />
            {/* Nose */}
            <path d="M36 44H44L40 48Z" fill="#92400E" />
            {/* Mouth */}
            {mood === 'speaking' ? (
              <ellipse cx="40" cy="52" rx="4.2" ry="3.4" fill="#991B1B" />
            ) : (
              <path
                d={mood === 'cheering' ? 'M33 50C36 55 44 55 47 50' : 'M35 50C37.5 53 42.5 53 45 50'}
                stroke="#78350F"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )}
          </>
        )}

        {characterId === 'squirrel' && (
          <>
            {/* Fluffy tail peeking on side */}
            <path
              d="M54 58C68 54 72 30 60 22C52 18 48 28 52 38"
              fill="#EA580C"
              stroke="#7C2D12"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Ears */}
            <path d="M23 26L20 12L31 20Z" fill="#EA580C" stroke="#7C2D12" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M57 26L60 12L49 20Z" fill="#EA580C" stroke="#7C2D12" strokeWidth="2.5" strokeLinejoin="round" />
            {/* Face */}
            <ellipse cx="40" cy="42" rx="20" ry="18" fill="#FB923C" stroke="#7C2D12" strokeWidth="2.5" />
            {/* Cream muzzle */}
            <ellipse cx="40" cy="48" rx="12" ry="9" fill="#FFEDD5" />
            {/* Eyes */}
            <circle cx="32" cy="37" r="3.2" fill="#431407" />
            <circle cx="48" cy="37" r="3.2" fill="#431407" />
            <circle cx="33" cy="36" r="1" fill="#FFFFFF" />
            <circle cx="49" cy="36" r="1" fill="#FFFFFF" />
            {/* Nose */}
            <circle cx="40" cy="45" r="2.6" fill="#7C2D12" />
            {/* Mouth */}
            {mood === 'speaking' ? (
              <ellipse cx="40" cy="51" rx="3.8" ry="3.2" fill="#991B1B" />
            ) : (
              <path
                d={mood === 'cheering' ? 'M34 49C37 54 43 54 46 49' : 'M35 49C37.5 52 42.5 52 45 49'}
                stroke="#7C2D12"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )}
            {/* Tiny golden seed badge */}
            <path d="M40 60C44 63 44 69 40 71C36 69 36 63 40 60Z" fill="#FBBF24" stroke="#B45309" strokeWidth="1.6" />
          </>
        )}
      </svg>
    </div>
  );
};
