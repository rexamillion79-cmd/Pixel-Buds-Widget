import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { WidgetTheme } from '../types/widget';
import { hexToRgba, isLightHex, resolveRingColor } from '../utils/color';
import {
  ChargingCaseIllustration,
  LeftBudIllustration,
  RightBudIllustration,
} from './PixelBudsArtwork';

export type UnitKind = 'left' | 'case' | 'right';

interface BatteryRingProps {
  unit: UnitKind;
  labelPrefix: 'L' | 'C' | 'R';
  level: number;
  isCharging: boolean;
  caseLidOpen?: boolean;
  theme: WidgetTheme;
  compact?: boolean;
  isSelected?: boolean;
  onSelectUnit?: (unit: UnitKind) => void;
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

export const BatteryRing: React.FC<BatteryRingProps> = ({
  unit,
  labelPrefix,
  level,
  isCharging,
  caseLidOpen = true,
  theme,
  compact = false,
  isSelected = false,
  onSelectUnit,
}) => {
  const clampedLevel = Math.max(0, Math.min(100, Math.round(level)));
  const isLowBattery = clampedLevel < 20;
  const isCriticalBattery = clampedLevel < 10;

  const activeRingColor = resolveRingColor(
    theme.ringColor,
    clampedLevel,
    theme.dynamicLowBattery
  );
  const warningBadgeColor = isCriticalBattery ? '#ef4444' : '#f59e0b';
  const activeBoltBg = isLowBattery ? warningBadgeColor : theme.dynamicLowBattery && clampedLevel <= 30 ? activeRingColor : theme.boltBgColor;

  const lightSurface = theme.bgOpacity >= 55 && isLightHex(theme.bgColor);
  const labelWarningColor = isCriticalBattery
    ? lightSurface
      ? '#b91c1c'
      : '#fca5a5'
    : lightSurface
    ? '#b45309'
    : '#fcd34d';

  const cx = 60;
  const cy = 62;
  const radius = 44;
  const strokeWidth = theme.ringThickness;

  // Leave a symmetric top gap at 12 o'clock when displaying a charging or low-battery badge
  const hasTopBadge = isCharging || isLowBattery;
  const gapHalfAngle = hasTopBadge ? 22 : 0;
  const startAngle = gapHalfAngle;
  const totalSweep = 360 - gapHalfAngle * 2;
  const endTrackAngle = startAngle + totalSweep;
  const progressSweep = (clampedLevel / 100) * totalSweep;
  const endProgressAngle = startAngle + progressSweep;

  const trackPath = hasTopBadge
    ? describeArc(cx, cy, radius, startAngle, endTrackAngle)
    : '';
  const progressPath =
    hasTopBadge && clampedLevel > 0
      ? describeArc(cx, cy, radius, startAngle, Math.min(endTrackAngle, endProgressAngle))
      : !hasTopBadge && clampedLevel > 0 && clampedLevel < 100
      ? describeArc(cx, cy, radius, 0, (clampedLevel / 100) * 360)
      : '';

  const ringPx = compact ? 76 : 112;
  const artPx = compact ? 34 : 50;

  const subtextLabel = isCharging
    ? unit === 'case'
      ? 'Case charging'
      : 'Charging'
    : isLowBattery
    ? 'Low battery'
    : unit === 'case'
    ? 'Standby'
    : 'In use';

  return (
    <button
      type="button"
      onClick={() => onSelectUnit?.(unit)}
      aria-label={`${
        unit === 'left' ? 'Left earbud' : unit === 'right' ? 'Right earbud' : 'Charging case'
      } battery ${clampedLevel} percent${isCharging ? ', charging' : ''}${
        isLowBattery ? ', low battery warning' : ''
      }`}
      className={`group flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 rounded-2xl p-1 transition-transform duration-150 ${
        onSelectUnit ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
      } ${isSelected ? 'ring-1 ring-white/25 bg-white/[0.04]' : ''}`}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: ringPx, height: ringPx }}
      >
        <svg
          width={ringPx}
          height={ringPx}
          viewBox="0 0 120 120"
          fill="none"
          className="overflow-visible"
        >
          {/* Inner shaded circular disc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius - strokeWidth / 2 - 4}
            fill={hexToRgba(theme.innerDiscColor, theme.innerDiscOpacity)}
          />

          {/* Track arc */}
          {hasTopBadge ? (
            <path
              d={trackPath}
              stroke={hexToRgba(theme.trackColor, theme.trackOpacity)}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              fill="none"
            />
          ) : (
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={hexToRgba(theme.trackColor, theme.trackOpacity)}
              strokeWidth={strokeWidth}
              fill="none"
            />
          )}

          {/* Active battery level progress */}
          {clampedLevel > 0 && (
            hasTopBadge ? (
              <path
                d={progressPath}
                stroke={activeRingColor}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                fill="none"
                className="transition-all duration-200 ease-out"
              />
            ) : clampedLevel === 100 ? (
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                stroke={activeRingColor}
                strokeWidth={strokeWidth}
                fill="none"
                className="transition-all duration-200 ease-out"
              />
            ) : (
              <path
                d={progressPath}
                stroke={activeRingColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-200 ease-out"
              />
            )
          )}

          {/* Top 12-o'clock badge: Lightning bolt when charging, or Exclamation warning badge when < 20% */}
          {isCharging ? (
            <g transform={`translate(${cx}, ${cy - radius})`}>
              <circle cx="0" cy="0" r="11.2" fill={activeBoltBg} />
              <path
                d="M1.2 -6.4L-4.3 0.9H0.1L-1.2 6.4L4.3 -0.9H-0.1L1.2 -6.4Z"
                fill={theme.boltIconColor}
              />
            </g>
          ) : isLowBattery ? (
            <g transform={`translate(${cx}, ${cy - radius})`}>
              <circle cx="0" cy="0" r="11.2" fill={warningBadgeColor} />
              <rect x="-1.35" y="-5.6" width="2.7" height="6.8" rx="1.35" fill="#0b182c" />
              <circle cx="0" cy="4.2" r="1.5" fill="#0b182c" />
            </g>
          ) : null}
        </svg>

        {/* Centered hardware artwork */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ paddingTop: compact ? 2 : 3 }}
        >
          {unit === 'left' && (
            <LeftBudIllustration colorway={theme.budsColorway} size={artPx} />
          )}
          {unit === 'case' && (
            <ChargingCaseIllustration
              colorway={theme.budsColorway}
              lidOpen={caseLidOpen}
              isCharging={isCharging}
              level={clampedLevel}
              size={artPx - 4}
            />
          )}
          {unit === 'right' && (
            <RightBudIllustration colorway={theme.budsColorway} size={artPx} />
          )}
        </div>
      </div>

      {/* Exact L / C / R percentage label with accessible low-battery warning icon when < 20% */}
      <span
        className={`inline-flex items-center gap-1 font-display tabular-nums tracking-[0.01em] transition-colors ${
          compact
            ? 'mt-1.5 text-[13px] font-medium'
            : 'mt-2.5 text-[17px] font-normal'
        }`}
        style={{ color: isLowBattery ? labelWarningColor : theme.textColor }}
      >
        {isLowBattery && (
          <AlertTriangle
            className={compact ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'}
            aria-hidden="true"
          />
        )}
        <span>
          {labelPrefix}: {clampedLevel}%
        </span>
      </span>

      {theme.showChargingSubtext && (
        <span
          className={`mt-0.5 tabular-nums opacity-75 ${
            compact ? 'text-[9px]' : 'text-[11px]'
          }`}
          style={{ color: isLowBattery ? labelWarningColor : theme.textColor }}
        >
          {subtextLabel}
        </span>
      )}
    </button>
  );
};
