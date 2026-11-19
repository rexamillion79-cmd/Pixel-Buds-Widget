import React from 'react';
import { BUDS_COLORWAYS } from '../constants/presets';
import { BudsColorway } from '../types/widget';

interface BudProps {
  colorway: BudsColorway;
  size?: number;
}

export const LeftBudIllustration: React.FC<BudProps> = ({ colorway, size = 44 }) => {
  const palette = BUDS_COLORWAYS[colorway];
  const gradId = `left-cap-${colorway}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
    >
      <defs>
        <radialGradient id={gradId} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor={palette.capHighlight} />
          <stop offset="55%" stopColor={palette.capBase} />
          <stop offset="100%" stopColor={palette.capShadow} />
        </radialGradient>
      </defs>

      {/* Dark inner housing + ergonomic wing/eartip extending left */}
      <path
        d="M18 24C11.5 24 7 28.5 7 34.5C7 40.5 12.2 44.5 19.5 44.5C24.5 44.5 29.5 43.2 32 41L30 22.5C26 22.5 22 23.2 18 24Z"
        fill={palette.wingColor}
      />
      {/* Silicone eartip dome */}
      <ellipse cx="14.5" cy="34.5" rx="6.2" ry="8.2" transform="rotate(-12 14.5 34.5)" fill="#101318" />
      <ellipse cx="13.5" cy="33.5" rx="3.2" ry="5.2" transform="rotate(-12 13.5 33.5)" fill="#252b34" opacity="0.55" />

      {/* Subtle top stabilizer nub */}
      <path
        d="M27 19C29.5 16.5 33.5 16 36 17.5C37.5 18.4 38 20.5 37 22.5L26.5 23C25.8 21.5 26 20 27 19Z"
        fill={palette.wingColor}
      />

      {/* Right-facing side shadow behind cap */}
      <ellipse cx="36" cy="33.5" rx="16.2" ry="16.2" fill="#0d1118" opacity="0.45" />

      {/* Main pebble touch cap */}
      <circle cx="35" cy="32.5" r="15.2" fill={`url(#${gradId})`} />

      {/* Subtle rim highlight */}
      <circle
        cx="35"
        cy="32.5"
        r="14.6"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.9"
      />

      {/* Minimal engraved G mark */}
      <path
        d="M38.2 30.2C37.4 29.3 36.2 28.8 34.9 28.8C32.4 28.8 30.5 30.7 30.5 33.1C30.5 35.5 32.4 37.4 34.9 37.4C37.2 37.4 38.9 35.9 39.1 33.6H35.2V32.2H40.5"
        stroke={palette.logoColor}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />
    </svg>
  );
};

export const RightBudIllustration: React.FC<BudProps> = ({ colorway, size = 44 }) => {
  const palette = BUDS_COLORWAYS[colorway];
  const gradId = `right-cap-${colorway}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
    >
      <defs>
        <radialGradient id={gradId} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor={palette.capHighlight} />
          <stop offset="55%" stopColor={palette.capBase} />
          <stop offset="100%" stopColor={palette.capShadow} />
        </radialGradient>
      </defs>

      {/* Dark inner housing + ergonomic wing/eartip extending right */}
      <path
        d="M46 24C52.5 24 57 28.5 57 34.5C57 40.5 51.8 44.5 44.5 44.5C39.5 44.5 34.5 43.2 32 41L34 22.5C38 22.5 42 23.2 46 24Z"
        fill={palette.wingColor}
      />
      {/* Silicone eartip dome */}
      <ellipse cx="49.5" cy="34.5" rx="6.2" ry="8.2" transform="rotate(12 49.5 34.5)" fill="#101318" />
      <ellipse cx="50.5" cy="33.5" rx="3.2" ry="5.2" transform="rotate(12 50.5 33.5)" fill="#252b34" opacity="0.55" />

      {/* Subtle top stabilizer nub */}
      <path
        d="M37 19C34.5 16.5 30.5 16 28 17.5C26.5 18.4 26 20.5 27 22.5L37.5 23C38.2 21.5 38 20 37 19Z"
        fill={palette.wingColor}
      />

      {/* Shadow behind cap */}
      <ellipse cx="28" cy="33.5" rx="16.2" ry="16.2" fill="#0d1118" opacity="0.45" />

      {/* Main pebble touch cap */}
      <circle cx="29" cy="32.5" r="15.2" fill={`url(#${gradId})`} />

      {/* Subtle rim highlight */}
      <circle
        cx="29"
        cy="32.5"
        r="14.6"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.9"
      />

      {/* Minimal engraved G mark */}
      <path
        d="M32.2 30.2C31.4 29.3 30.2 28.8 28.9 28.8C26.4 28.8 24.5 30.7 24.5 33.1C24.5 35.5 26.4 37.4 28.9 37.4C31.2 37.4 32.9 35.9 33.1 33.6H29.2V32.2H34.5"
        stroke={palette.logoColor}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />
    </svg>
  );
};

interface CaseProps {
  colorway: BudsColorway;
  lidOpen: boolean;
  isCharging: boolean;
  level: number;
  size?: number;
}

export const ChargingCaseIllustration: React.FC<CaseProps> = ({
  colorway,
  lidOpen,
  isCharging,
  level,
  size = 48,
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);
  const palette = BUDS_COLORWAYS[colorway];
  const shellGradId = `case-shell-${colorway}`;
  const ledColor = isCharging
    ? level >= 95
      ? '#34d399'
      : '#fbbf24'
    : level <= 15
    ? '#f87171'
    : '#ffffff';

  if (!imgFailed) {
    return (
      <div
        className="relative flex items-center justify-center overflow-visible"
        style={{ width: size, height: size }}
      >
        <img
          src="/assets/aistudio/840353930506-frontimage_60ccabdd.png"
          alt="Pixel Buds charging case"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)]"
          style={{
            transform: lidOpen ? 'scale(1.06)' : 'scale(1.02)',
          }}
        />
        {(isCharging || level <= 15) && (
          <span
            aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{
              width: Math.max(3, Math.round(size * 0.07)),
              height: Math.max(3, Math.round(size * 0.07)),
              top: '54%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: ledColor,
              boxShadow: `0 0 6px ${ledColor}`,
              opacity: isCharging && level >= 95 ? 0.85 : 0.95,
            }}
          />
        )}
      </div>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.42)]"
    >
      <defs>
        <linearGradient id={shellGradId} x1="16" y1="24" x2="48" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.caseShell} />
          <stop offset="100%" stopColor={palette.caseShellShadow} />
        </linearGradient>
      </defs>
      <path
        d="M17 20C17 11.5 23.5 7 32 7C40.5 7 47 11.5 47 20V25H17V20Z"
        fill={palette.caseShell}
      />
      <path
        d="M19 20.5C19 13.5 24.5 9.5 32 9.5C39.5 9.5 45 13.5 45 20.5V26.5H19V20.5Z"
        fill={palette.caseInterior}
      />
      <path
        d="M15.5 25.5C15.5 24.6 16.2 24 17.1 24H46.9C47.8 24 48.5 24.6 48.5 25.5V34.5C48.5 46.2 41.8 55.5 32 55.5C22.2 55.5 15.5 46.2 15.5 34.5V25.5Z"
        fill={`url(#${shellGradId})`}
      />
      <circle cx="32" cy="30.5" r="1.35" fill={ledColor} />
    </svg>
  );
};
