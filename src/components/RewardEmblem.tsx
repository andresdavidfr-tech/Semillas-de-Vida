import React from 'react';
import { RewardIconKey } from '../data/verses';

interface RewardEmblemProps {
  iconKey: RewardIconKey;
  unlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RewardEmblem: React.FC<RewardEmblemProps> = ({
  iconKey,
  unlocked = true,
  size = 'md',
}) => {
  const dims =
    size === 'sm' ? 'w-11 h-11' : size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';

  const bgClass = unlocked
    ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 shadow-sm'
    : 'bg-stone-100 border-stone-200 opacity-55 grayscale';

  return (
    <div
      className={`${dims} rounded-2xl border-2 flex items-center justify-center shrink-0 transition-transform duration-200 ${bgClass}`}
    >
      <svg
        viewBox="0 0 48 48"
        className={size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-7 h-7' : 'w-10 h-10'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {iconKey === 'sun' && (
          <>
            <circle cx="24" cy="24" r="9" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <path
              d="M24 6V11M24 37V42M6 24H11M37 24H42M11.3 11.3L14.8 14.8M33.2 33.2L36.7 36.7M36.7 11.3L33.2 14.8M14.8 33.2L11.3 36.7"
              stroke="#D97706"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}
        {iconKey === 'lamp' && (
          <>
            <path
              d="M17 18H31L29 33H19L17 18Z"
              fill="#FDE68A"
              stroke="#B45309"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M15 33H33V37H15V33Z" fill="#92400E" />
            <path
              d="M24 9C24 9 27.5 13 27.5 15.5C27.5 17.4 25.9 18.8 24 18.8C22.1 18.8 20.5 17.4 20.5 15.5C20.5 13 24 9 24 9Z"
              fill="#F59E0B"
            />
            <path d="M24 5V7M13 13L15 15M35 13L33 15" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {iconKey === 'heart' && (
          <path
            d="M24 40C24 40 9 30.2 9 18.5C9 13.5 12.9 9.5 17.8 9.5C20.7 9.5 23 11.1 24 13C25 11.1 27.3 9.5 30.2 9.5C35.1 9.5 39 13.5 39 18.5C39 30.2 24 40 24 40Z"
            fill="#EF4444"
            stroke="#991B1B"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}
        {iconKey === 'staff' && (
          <>
            <path
              d="M21 40V16C21 11.5 24.5 8 28.5 8C32.5 8 35 11 35 14.5C35 17.5 32.5 19 30 19"
              stroke="#78350F"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path d="M14 27C16 24 19 24 21 26" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="14" cy="27" r="2.5" fill="#22C55E" />
          </>
        )}
        {iconKey === 'key' && (
          <>
            <circle cx="16" cy="24" r="7" fill="#FDE047" stroke="#A16207" strokeWidth="2.5" />
            <circle cx="16" cy="24" r="2.5" fill="#FEF9C3" />
            <path
              d="M23 24H39M33 24V30M38 24V28"
              stroke="#A16207"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}
        {iconKey === 'crown' && (
          <>
            <path
              d="M9 33L12 15L19 23L24 12L29 23L36 15L39 33H9Z"
              fill="#FBBF24"
              stroke="#92400E"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <rect x="9" y="33" width="30" height="5" rx="1.5" fill="#D97706" />
          </>
        )}
        {iconKey === 'branch' && (
          <>
            <path d="M12 36C18 30 27 21 36 12" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
            <path
              d="M20 28C16 24 16 19 20 17C24 19 24 24 20 28Z"
              fill="#22C55E"
              stroke="#15803D"
              strokeWidth="1.8"
            />
            <path
              d="M27 21C31 24 35 23 37 19C33 17 29 18 27 21Z"
              fill="#4ADE80"
              stroke="#15803D"
              strokeWidth="1.8"
            />
            <path
              d="M32 14C29 10 31 6 35 6C37 9 36 13 32 14Z"
              fill="#22C55E"
              stroke="#15803D"
              strokeWidth="1.8"
            />
          </>
        )}
        {iconKey === 'harp' && (
          <>
            <path
              d="M15 37V12C15 9 20 9 23 12C27 16 33 14 35 12V37H15Z"
              fill="#FEF3C7"
              stroke="#B45309"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M20 14V37M25 16V37M30 16V37" stroke="#D97706" strokeWidth="1.8" />
          </>
        )}
        {iconKey === 'shield' && (
          <>
            <path
              d="M24 8L37 13V24C37 32 31 38 24 41C17 38 11 32 11 24V13L24 8Z"
              fill="#38BDF8"
              stroke="#0369A1"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M24 14V34M17 22H31" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        {iconKey === 'torch' && (
          <>
            <path d="M20 23H28L26 40H22L20 23Z" fill="#92400E" stroke="#78350F" strokeWidth="2" />
            <path
              d="M24 8C24 8 31 14 31 18.5C31 22 27.9 24 24 24C20.1 24 17 22 17 18.5C17 14 24 8 24 8Z"
              fill="#F97316"
              stroke="#C2410C"
              strokeWidth="1.8"
            />
            <circle cx="24" cy="18.5" r="2.5" fill="#FDE047" />
          </>
        )}
        {iconKey === 'breath' && (
          <>
            <path
              d="M10 20H29C32.5 20 35 17.5 35 14.5C35 11.5 32.5 9 29.5 9C27 9 25 10.5 24.5 12.5"
              stroke="#0D9488"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M8 26H34C37 26 39 28 39 30.5C39 33 37 35 34.5 35C32.5 35 31 33.8 30.5 32"
              stroke="#14B8A6"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path d="M12 32H25" stroke="#0F766E" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
        {iconKey === 'tree' && (
          <>
            <path d="M22 38V26H26V38H22Z" fill="#78350F" />
            <circle cx="24" cy="18" r="10" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
            <circle cx="17" cy="22" r="6" fill="#4ADE80" stroke="#15803D" strokeWidth="1.8" />
            <circle cx="31" cy="22" r="6" fill="#4ADE80" stroke="#15803D" strokeWidth="1.8" />
            <circle cx="24" cy="14" r="2.2" fill="#FBBF24" />
            <circle cx="19" cy="20" r="2.2" fill="#FBBF24" />
            <circle cx="29" cy="20" r="2.2" fill="#FBBF24" />
          </>
        )}
      </svg>
    </div>
  );
};
