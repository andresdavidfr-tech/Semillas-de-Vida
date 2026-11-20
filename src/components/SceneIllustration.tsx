import React from 'react';
import { SceneIconKey } from '../data/pictureLevels';

interface SceneIllustrationProps {
  iconKey: SceneIconKey;
  size?: 'sm' | 'md' | 'lg';
}

export const SceneIllustration: React.FC<SceneIllustrationProps> = ({
  iconKey,
  size = 'lg',
}) => {
  const sizeClass =
    size === 'sm' ? 'w-14 h-14' : size === 'md' ? 'w-24 h-24' : 'w-28 h-28 sm:w-32 sm:h-32';

  return (
    <svg
      viewBox="0 0 120 120"
      className={sizeClass}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {iconKey === 'dawn' && (
        <>
          <rect width="120" height="120" rx="24" fill="#FEF3C7" />
          <path d="M0 78H120V120H0V78Z" fill="#FDE68A" />
          <circle cx="60" cy="76" r="28" fill="#F59E0B" />
          <circle cx="60" cy="76" r="20" fill="#FBBF24" />
          <path
            d="M60 22V36M26 42L36 52M94 42L84 52M14 74H26M94 74H106"
            stroke="#D97706"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path d="M0 84C30 74 90 74 120 84V120H0V84Z" fill="#15803D" />
        </>
      )}

      {iconKey === 'creator-hands' && (
        <>
          <rect width="120" height="120" rx="24" fill="#E0F2FE" />
          <circle cx="60" cy="46" r="18" fill="#FBBF24" />
          <path
            d="M60 16L62.5 23L70 23L64 27.5L66 34.5L60 30L54 34.5L56 27.5L50 23L57.5 23L60 16Z"
            fill="#F59E0B"
          />
          <circle cx="28" cy="30" r="4" fill="#F59E0B" />
          <circle cx="92" cy="32" r="5" fill="#FBBF24" />
          <path
            d="M20 82C30 68 46 68 54 78L60 84L66 78C74 68 90 68 100 82V104H20V82Z"
            fill="#FDBA74"
            stroke="#C2410C"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </>
      )}

      {iconKey === 'sky-clouds' && (
        <>
          <rect width="120" height="120" rx="24" fill="#BAE6FD" />
          <circle cx="88" cy="34" r="15" fill="#FBBF24" />
          <path
            d="M28 74H76C83 74 88 69 88 62C88 55 83 50 76 50C75 41 67 35 58 35C48 35 40 42 39 52C32 52 26 57 26 64C26 70 28 74 28 74Z"
            fill="#FFFFFF"
            stroke="#38BDF8"
            strokeWidth="3"
          />
          <path
            d="M22 96H56C61 96 65 92 65 87C65 82 61 78 56 78C55 72 49 68 43 68C36 68 31 73 30 79C25 79 20 83 20 88C20 93 22 96 22 96Z"
            fill="#F8FAFC"
            stroke="#7DD3FC"
            strokeWidth="2.5"
          />
        </>
      )}

      {iconKey === 'earth-garden' && (
        <>
          <rect width="120" height="120" rx="24" fill="#DCFCE7" />
          <circle cx="60" cy="60" r="38" fill="#38BDF8" stroke="#0284C7" strokeWidth="3.5" />
          <path
            d="M35 45C45 38 56 44 54 55C52 65 40 68 38 78C31 70 28 54 35 45Z"
            fill="#22C55E"
          />
          <path
            d="M66 36C78 36 88 48 86 64C84 74 74 82 65 78C59 75 63 62 70 57C76 52 62 42 66 36Z"
            fill="#16A34A"
          />
          <circle cx="24" cy="24" r="4" fill="#FBBF24" />
          <circle cx="96" cy="92" r="5" fill="#FBBF24" />
        </>
      )}

      {iconKey === 'seed-sprout' && (
        <>
          <rect width="120" height="120" rx="24" fill="#ECFDF5" />
          <path d="M16 94C40 84 80 84 104 94V108H16V94Z" fill="#92400E" />
          <path d="M60 90V44" stroke="#15803D" strokeWidth="6" strokeLinecap="round" />
          <path
            d="M60 66C38 66 30 48 36 36C49 36 60 48 60 66Z"
            fill="#22C55E"
            stroke="#15803D"
            strokeWidth="3"
          />
          <path
            d="M60 56C82 56 90 38 84 26C71 26 60 38 60 56Z"
            fill="#4ADE80"
            stroke="#15803D"
            strokeWidth="3"
          />
          <circle cx="60" cy="22" r="6" fill="#FBBF24" />
        </>
      )}

      {iconKey === 'bright-sun' && (
        <>
          <rect width="120" height="120" rx="24" fill="#FEF9C3" />
          <circle cx="60" cy="60" r="24" fill="#F59E0B" stroke="#B45309" strokeWidth="3.5" />
          <circle cx="60" cy="60" r="15" fill="#FDE047" />
          <path
            d="M60 14V26M60 94V106M14 60H26M94 60H106M27 27L36 36M84 84L93 93M93 27L84 36M36 84L27 93"
            stroke="#D97706"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      )}

      {iconKey === 'happy-kids' && (
        <>
          <rect width="120" height="120" rx="24" fill="#FFEDD5" />
          {/* Child 1 */}
          <circle cx="42" cy="48" r="14" fill="#FDE68A" stroke="#B45309" strokeWidth="2.5" />
          <circle cx="38" cy="46" r="2" fill="#1A2E22" />
          <circle cx="46" cy="46" r="2" fill="#1A2E22" />
          <path d="M38 52C40 55 44 55 46 52" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M26 88C26 73 34 65 42 65C50 65 58 73 58 88H26Z" fill="#22C55E" />
          {/* Child 2 */}
          <circle cx="78" cy="48" r="14" fill="#FDBA74" stroke="#9A3412" strokeWidth="2.5" />
          <circle cx="74" cy="46" r="2" fill="#1A2E22" />
          <circle cx="82" cy="46" r="2" fill="#1A2E22" />
          <path d="M74 52C76 55 80 55 82 52" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M62 88C62 73 70 65 78 65C86 65 94 73 94 88H62Z" fill="#3B82F6" />
          {/* Sparkles */}
          <path d="M60 18L62 24L68 26L62 28L60 34L58 28L52 26L58 24L60 18Z" fill="#F59E0B" />
        </>
      )}

      {iconKey === 'warm-heart' && (
        <>
          <rect width="120" height="120" rx="24" fill="#FFE4E6" />
          <path
            d="M60 94C60 94 24 70 24 44C24 32 33 24 44 24C51 24 57 28 60 34C63 28 69 24 76 24C87 24 96 32 96 44C96 70 60 94 60 94Z"
            fill="#EF4444"
            stroke="#991B1B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M38 38C35 41 34 45 35 49" stroke="#FCA5A5" strokeWidth="4" strokeLinecap="round" />
        </>
      )}

      {iconKey === 'helping-hands' && (
        <>
          <rect width="120" height="120" rx="24" fill="#FEF2F2" />
          <circle cx="60" cy="36" r="12" fill="#FBBF24" />
          <path
            d="M22 68C32 54 48 56 58 68L60 70L62 68C72 56 88 54 98 68L88 94H32L22 68Z"
            fill="#FB923C"
            stroke="#9A3412"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M60 50C60 50 48 42 48 34C48 30 51 27 55 27C58 27 60 29 60 31C60 29 62 27 65 27C69 27 72 30 72 34C72 42 60 50 60 50Z"
            fill="#EF4444"
          />
        </>
      )}

      {iconKey === 'shepherd-lamb' && (
        <>
          <rect width="120" height="120" rx="24" fill="#ECFDF5" />
          {/* Staff */}
          <path
            d="M32 96V36C32 25 40 18 49 18C57 18 62 24 62 32C62 38 57 42 52 42"
            stroke="#78350F"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Cute Lamb */}
          <circle cx="72" cy="70" r="18" fill="#FFFFFF" stroke="#D6D3D1" strokeWidth="3" />
          <circle cx="88" cy="64" r="12" fill="#FEF3C7" stroke="#92400E" strokeWidth="2.5" />
          <ellipse cx="97" cy="60" rx="4" ry="7" transform="rotate(-25 97 60)" fill="#FDBA74" />
          <circle cx="86" cy="62" r="2" fill="#1A2E22" />
          <circle cx="92" cy="62" r="2" fill="#1A2E22" />
          <path d="M62 86V96M80 86V96" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
        </>
      )}

      {iconKey === 'green-pasture' && (
        <>
          <rect width="120" height="120" rx="24" fill="#DBEAFE" />
          <circle cx="30" cy="30" r="12" fill="#FBBF24" />
          <path d="M0 72C35 56 85 56 120 72V120H0V72Z" fill="#4ADE80" />
          <path d="M0 86C40 72 80 96 120 82V120H0V86Z" fill="#22C55E" />
          <path d="M24 96C48 84 68 102 96 90V120H24V96Z" fill="#38BDF8" />
          <circle cx="34" cy="76" r="4" fill="#F43F5E" />
          <circle cx="86" cy="74" r="4" fill="#FBBF24" />
        </>
      )}

      {iconKey === 'sparkling-path' && (
        <>
          <rect width="120" height="120" rx="24" fill="#FEF3C7" />
          <path d="M0 70H120V120H0V70Z" fill="#86EFAC" />
          <path d="M48 70L68 70L98 120H22L48 70Z" fill="#FBBF24" stroke="#B45309" strokeWidth="3" />
          <circle cx="60" cy="40" r="18" fill="#F59E0B" />
          <path d="M60 12V20M34 38H42M78 38H86" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
        </>
      )}

      {iconKey === 'open-door' && (
        <>
          <rect width="120" height="120" rx="24" fill="#E0E7FF" />
          <rect x="34" y="22" width="52" height="80" rx="8" fill="#FDE68A" stroke="#92400E" strokeWidth="3" />
          <path d="M34 22L70 30V94L34 102V22Z" fill="#B45309" stroke="#78350F" strokeWidth="3" />
          <circle cx="62" cy="64" r="3.5" fill="#FDE047" />
        </>
      )}

      {iconKey === 'joy-music' && (
        <>
          <rect width="120" height="120" rx="24" fill="#FEF3C7" />
          <path
            d="M46 80V34L86 24V70"
            stroke="#1B4332"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M46 46L86 36" stroke="#1B4332" strokeWidth="5" />
          <circle cx="38" cy="82" r="11" fill="#F59E0B" stroke="#92400E" strokeWidth="3" />
          <circle cx="78" cy="72" r="11" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
          <circle cx="28" cy="36" r="4" fill="#22C55E" />
          <circle cx="96" cy="54" r="5" fill="#3B82F6" />
        </>
      )}

      {iconKey === 'lamp-feet' && (
        <>
          <rect width="120" height="120" rx="24" fill="#1E293B" />
          <path d="M60 54L22 104H98L60 54Z" fill="#FEF08A" opacity="0.4" />
          <rect x="46" y="26" width="28" height="26" rx="4" fill="#FDE047" stroke="#F59E0B" strokeWidth="3" />
          <path d="M42 52H78V60H42V52Z" fill="#D97706" />
          {/* Two little shoes on lighted path */}
          <ellipse cx="46" cy="92" rx="10" ry="6" fill="#38BDF8" />
          <ellipse cx="74" cy="92" rx="10" ry="6" fill="#38BDF8" />
        </>
      )}

      {iconKey === 'bible-glow' && (
        <>
          <rect width="120" height="120" rx="24" fill="#FEF9C3" />
          <path
            d="M22 38C22 34 26 32 30 32H56C58 32 60 35 60 38V90C60 88 57 86 54 86H26C24 86 22 84 22 82V38Z"
            fill="#FFFFFF"
            stroke="#1B4332"
            strokeWidth="3.5"
          />
          <path
            d="M98 38C98 34 94 32 90 32H64C62 32 60 35 60 38V90C60 88 63 86 66 86H94C96 86 98 84 98 82V38Z"
            fill="#FFFBEB"
            stroke="#1B4332"
            strokeWidth="3.5"
          />
          <path d="M32 48H50M32 60H50M70 48H88M70 60H88" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M60 14L63 22L70 24L63 26L60 32L57 26L50 24L57 22L60 14Z" fill="#F59E0B" />
        </>
      )}

      {iconKey === 'gift-box' && (
        <>
          <rect width="120" height="120" rx="24" fill="#FCE7F3" />
          <rect x="28" y="48" width="64" height="50" rx="8" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
          <rect x="24" y="38" width="72" height="14" rx="5" fill="#F87171" stroke="#991B1B" strokeWidth="3" />
          <rect x="54" y="38" width="12" height="60" fill="#FACC15" />
          <path
            d="M60 38C50 26 38 28 40 36C42 40 52 38 60 38ZM60 38C70 26 82 28 80 36C78 40 68 38 60 38Z"
            fill="#FACC15"
            stroke="#B45309"
            strokeWidth="2.5"
          />
        </>
      )}

      {iconKey === 'tree-eternal' && (
        <>
          <rect width="120" height="120" rx="24" fill="#DCFCE7" />
          <rect x="52" y="66" width="16" height="38" rx="4" fill="#78350F" />
          <circle cx="60" cy="48" r="24" fill="#22C55E" stroke="#15803D" strokeWidth="3" />
          <circle cx="42" cy="56" r="16" fill="#4ADE80" stroke="#15803D" strokeWidth="2.5" />
          <circle cx="78" cy="56" r="16" fill="#4ADE80" stroke="#15803D" strokeWidth="2.5" />
          <circle cx="60" cy="38" r="5" fill="#FBBF24" />
          <circle cx="44" cy="54" r="5" fill="#EF4444" />
          <circle cx="76" cy="54" r="5" fill="#FBBF24" />
        </>
      )}

      {/* Playful Visual Distractors */}
      {iconKey === 'shoe-distractor' && (
        <>
          <rect width="120" height="120" rx="24" fill="#F1F5F9" />
          <path
            d="M26 76V52L46 48L60 64H88C94 64 98 70 98 76V84H26V76Z"
            fill="#64748B"
            stroke="#334155"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <rect x="24" y="82" width="76" height="8" rx="4" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
        </>
      )}

      {iconKey === 'cake-distractor' && (
        <>
          <rect width="120" height="120" rx="24" fill="#FFF1F2" />
          <rect x="28" y="56" width="64" height="36" rx="8" fill="#FBCFE8" stroke="#BE185D" strokeWidth="3" />
          <path d="M28 66C36 74 44 66 52 74C60 66 68 74 76 66C84 74 92 66 92 66" stroke="#DB2777" strokeWidth="4" strokeLinecap="round" />
          <rect x="57" y="34" width="6" height="22" fill="#F59E0B" />
          <circle cx="60" cy="28" r="5" fill="#EF4444" />
        </>
      )}

      {iconKey === 'umbrella-distractor' && (
        <>
          <rect width="120" height="120" rx="24" fill="#F0F9FF" />
          <path
            d="M22 60C22 38 39 24 60 24C81 24 98 38 98 60H22Z"
            fill="#8B5CF6"
            stroke="#5B21B6"
            strokeWidth="3"
          />
          <path d="M60 60V88C60 94 52 96 48 92" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
        </>
      )}

      {iconKey === 'balloon-distractor' && (
        <>
          <rect width="120" height="120" rx="24" fill="#F5F3FF" />
          <ellipse cx="60" cy="48" rx="22" ry="26" fill="#06B6D4" stroke="#0E7490" strokeWidth="3" />
          <path d="M60 74L56 80H64L60 74Z" fill="#06B6D4" />
          <path d="M60 80C56 90 66 96 58 106" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};
