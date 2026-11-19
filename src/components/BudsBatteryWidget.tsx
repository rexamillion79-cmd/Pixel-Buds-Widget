import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { BatteryState, WidgetTheme } from '../types/widget';
import { hexToRgba, isLightHex } from '../utils/color';
import { BatteryRing, UnitKind } from './BatteryRing';

interface BudsBatteryWidgetProps {
  battery: BatteryState;
  theme: WidgetTheme;
  compact?: boolean;
  selectedUnit?: UnitKind | null;
  onSelectUnit?: (unit: UnitKind) => void;
  className?: string;
}

export const BudsBatteryWidget: React.FC<BudsBatteryWidgetProps> = ({
  battery,
  theme,
  compact = false,
  selectedUnit = null,
  onSelectUnit,
  className = '',
}) => {
  const lowUnits: string[] = [];
  if (battery.left < 20) lowUnits.push('Left');
  if (battery.caseLevel < 20) lowUnits.push('Case');
  if (battery.right < 20) lowUnits.push('Right');

  const hasLowBattery = lowUnits.length > 0;
  const hasCriticalBattery =
    battery.left < 10 || battery.caseLevel < 10 || battery.right < 10;

  const bgRgba = hexToRgba(theme.bgColor, theme.bgOpacity);
  const defaultBorder =
    theme.borderOpacity > 0
      ? `rgba(255, 255, 255, ${(theme.borderOpacity / 100).toFixed(2)})`
      : 'transparent';
  const borderRgba = hasLowBattery
    ? hasCriticalBattery
      ? 'rgba(239, 68, 68, 0.55)'
      : 'rgba(245, 158, 11, 0.5)'
    : defaultBorder;

  const lightSurface = theme.bgOpacity >= 55 && isLightHex(theme.bgColor);
  const warningTextColor = hasCriticalBattery
    ? lightSurface
      ? '#b91c1c'
      : '#fca5a5'
    : lightSurface
    ? '#b45309'
    : '#fcd34d';

  return (
    <div
      className={`relative select-none transition-all duration-200 ${
        compact ? 'px-3.5 py-3.5' : 'px-7 py-6 sm:px-9 sm:py-7'
      } ${className}`}
      style={{
        backgroundColor: bgRgba,
        backdropFilter: theme.blurAmount > 0 ? `blur(${theme.blurAmount}px)` : undefined,
        WebkitBackdropFilter: theme.blurAmount > 0 ? `blur(${theme.blurAmount}px)` : undefined,
        borderRadius: `${theme.cornerRadius}px`,
        border: `1px solid ${borderRgba}`,
        boxShadow:
          theme.bgOpacity > 10 || theme.blurAmount > 4
            ? '0 16px 40px -12px rgba(0, 0, 0, 0.45)'
            : undefined,
      }}
    >
      <div
        className={`grid grid-cols-3 items-start justify-items-center ${
          compact ? 'gap-2' : 'gap-4 sm:gap-8'
        }`}
      >
        <BatteryRing
          unit="left"
          labelPrefix="L"
          level={battery.left}
          isCharging={battery.leftCharging}
          theme={theme}
          compact={compact}
          isSelected={selectedUnit === 'left'}
          onSelectUnit={onSelectUnit}
        />

        <BatteryRing
          unit="case"
          labelPrefix="C"
          level={battery.caseLevel}
          isCharging={battery.caseCharging}
          caseLidOpen={battery.caseLidOpen}
          theme={theme}
          compact={compact}
          isSelected={selectedUnit === 'case'}
          onSelectUnit={onSelectUnit}
        />

        <BatteryRing
          unit="right"
          labelPrefix="R"
          level={battery.right}
          isCharging={battery.rightCharging}
          theme={theme}
          compact={compact}
          isSelected={selectedUnit === 'right'}
          onSelectUnit={onSelectUnit}
        />
      </div>

      {hasLowBattery && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center justify-center gap-1.5 border-t border-white/10 ${
            compact ? 'mt-2.5 pt-2 text-[10px]' : 'mt-4 pt-3 text-xs'
          } font-medium tracking-[0.01em]`}
          style={{ color: warningTextColor }}
        >
          <AlertTriangle
            className={compact ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'}
            aria-hidden="true"
          />
          <span>Low battery (&lt;20%): {lowUnits.join(' · ')}</span>
        </div>
      )}
    </div>
  );
};
