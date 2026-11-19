import React, { useRef, useState } from 'react';
import { Maximize2, Upload, Battery, Wifi, Signal } from 'lucide-react';
import { WALLPAPER_OPTIONS } from '../constants/presets';
import { BatteryState, WallpaperId, WidgetTheme } from '../types/widget';
import { UnitKind } from './BatteryRing';
import { BudsBatteryWidget } from './BudsBatteryWidget';
import { PWAInstallButton } from './PWAInstallButton';

export type PreviewMode = 'standalone' | 'pixel9' | 'compare';

interface Pixel9PreviewStageProps {
  battery: BatteryState;
  theme: WidgetTheme;
  selectedUnit: UnitKind | null;
  onSelectUnit: (unit: UnitKind) => void;
  wallpaperId: WallpaperId;
  customWallpaperUrl: string | null;
  onChangeWallpaper: (id: WallpaperId) => void;
  onUploadWallpaper: (dataUrl: string) => void;
  onOpenFullscreen: () => void;
}

export const Pixel9PreviewStage: React.FC<Pixel9PreviewStageProps> = ({
  battery,
  theme,
  selectedUnit,
  onSelectUnit,
  wallpaperId,
  customWallpaperUrl,
  onChangeWallpaper,
  onUploadWallpaper,
  onOpenFullscreen,
}) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('standalone');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeWallpaper = WALLPAPER_OPTIONS.find((w) => w.id === wallpaperId);
  const stageBackgroundStyle: React.CSSProperties =
    wallpaperId === 'custom' && customWallpaperUrl
      ? {
          backgroundImage: `url(${customWallpaperUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {
          background:
            activeWallpaper?.backgroundStyle ?? WALLPAPER_OPTIONS[0].backgroundStyle,
        };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadWallpaper(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const now = new Date();
  const formattedTime = now.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  const formattedDate = now.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <section aria-label="Widget Preview" className="flex flex-col gap-5">
      {/* Mode toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Preview layout mode"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-white/10"
        >
          <button
            type="button"
            role="tab"
            aria-selected={previewMode === 'standalone'}
            onClick={() => setPreviewMode('standalone')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              previewMode === 'standalone'
                ? 'bg-slate-100 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Widget Canvas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={previewMode === 'pixel9'}
            onClick={() => setPreviewMode('pixel9')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              previewMode === 'pixel9'
                ? 'bg-slate-100 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Pixel 9 Screen
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={previewMode === 'compare'}
            onClick={() => setPreviewMode('compare')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              previewMode === 'compare'
                ? 'bg-slate-100 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Compare Reference
          </button>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton compact />
          <button
            type="button"
            onClick={onOpenFullscreen}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-100 border border-white/10 transition-colors whitespace-nowrap shrink-0 min-h-[36px]"
          >
            <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Standalone View</span>
          </button>
        </div>
      </div>

      {/* Main visual stage */}
      {previewMode === 'standalone' && (
        <div
          className="relative w-full min-h-[340px] sm:min-h-[380px] rounded-3xl overflow-hidden flex flex-col items-center justify-center p-5 sm:p-10 border border-white/10 transition-all duration-200"
          style={stageBackgroundStyle}
        >
          {/* Subtle grid texture only when transparency < 100% and using reference navy so user sees glass effect */}
          {theme.bgOpacity < 100 && wallpaperId === 'reference_navy' && (
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 25% 30%, rgba(56, 189, 248, 0.35), transparent 48%), radial-gradient(circle at 75% 70%, rgba(52, 211, 153, 0.28), transparent 48%)',
              }}
            />
          )}

          <div className="relative z-10 w-full max-w-[490px]">
            <BudsBatteryWidget
              battery={battery}
              theme={theme}
              selectedUnit={selectedUnit}
              onSelectUnit={onSelectUnit}
            />
          </div>

          <p className="relative z-10 mt-5 text-xs text-white/60 text-center">
            Tap any ring (L, C, or R) to edit its charge level or toggle charging
          </p>
        </div>
      )}

      {previewMode === 'pixel9' && (
        <div className="w-full flex justify-center py-2">
          {/* Pixel 9 hardware frame */}
          <div className="relative w-full max-w-[356px] rounded-[46px] p-[11px] bg-[#1b1f27] border border-white/15 shadow-2xl">
            <div
              className="relative w-full aspect-[9/19.5] rounded-[36px] overflow-hidden flex flex-col justify-between p-4"
              style={stageBackgroundStyle}
            >
              {/* Pixel 9 Status bar & Punch-hole camera */}
              <div>
                <div className="flex items-center justify-between px-2 pt-0.5 text-[11px] font-medium text-white/95">
                  <span className="tabular-nums">{formattedTime}</span>
                  {/* Center camera cutout */}
                  <span
                    aria-hidden="true"
                    className="w-3.5 h-3.5 rounded-full bg-black border border-white/10"
                  />
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Signal className="w-3 h-3" aria-hidden="true" />
                    <Wifi className="w-3 h-3" aria-hidden="true" />
                    <Battery className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                </div>

                {/* Pixel At a Glance */}
                <div className="mt-5 px-2">
                  <p className="text-[19px] font-display font-medium text-white tracking-tight">
                    {formattedDate}
                  </p>
                  <p className="text-xs text-white/80 mt-0.5 tabular-nums">
                    68°F · Pixel Buds 2a connected
                  </p>
                </div>

                {/* 4x2 Pixel Buds 2a Battery Widget */}
                <div className="mt-5">
                  <BudsBatteryWidget
                    battery={battery}
                    theme={theme}
                    compact
                    selectedUnit={selectedUnit}
                    onSelectUnit={onSelectUnit}
                  />
                </div>
              </div>

              {/* Pixel Launcher dock & Search bar */}
              <div className="flex flex-col gap-4 pb-1">
                {/* Material You themed app icons */}
                <div className="grid grid-cols-4 gap-3 px-2 justify-items-center">
                  {['Phone', 'Messages', 'Chrome', 'Camera'].map((app, idx) => (
                    <div key={app} className="flex flex-col items-center gap-1">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold border border-white/10 backdrop-blur-md"
                        style={{
                          backgroundColor:
                            idx === 0
                              ? 'rgba(167, 243, 208, 0.24)'
                              : idx === 1
                              ? 'rgba(191, 219, 254, 0.24)'
                              : idx === 2
                              ? 'rgba(221, 214, 254, 0.24)'
                              : 'rgba(254, 215, 170, 0.24)',
                        }}
                      >
                        <span className="text-[10px] text-white/90">
                          {app.slice(0, 2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Google Search pill */}
                <div className="mx-1 h-11 rounded-full bg-white/18 backdrop-blur-md border border-white/15 flex items-center justify-between px-4 text-xs text-white/80">
                  <span className="font-medium tracking-tight">G</span>
                  <span className="text-white/60">Search Pixel 9</span>
                  <span className="w-4 h-4 rounded-full border border-white/40" />
                </div>

                {/* Android gesture bar */}
                <div className="w-24 h-1 rounded-full bg-white/60 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      )}

      {previewMode === 'compare' && (
        <div className="flex flex-col gap-4 rounded-3xl p-5 bg-slate-900/70 border border-white/10">
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">
              Live Customizable Widget
            </p>
            <div
              className="rounded-2xl p-5 flex items-center justify-center"
              style={stageBackgroundStyle}
            >
              <BudsBatteryWidget
                battery={battery}
                theme={theme}
                selectedUnit={selectedUnit}
                onSelectUnit={onSelectUnit}
                className="w-full max-w-[490px]"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">
              Attached Reference Image
            </p>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0b1b34]">
              <img
                src="/assets/aistudio/Pixel-Buds-fully-charged-notification_1_1_464f2a11.jpg"
                alt="Attached reference showing Pixel Buds L, C, R 100% battery rings"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Wallpaper selector strip for testing transparency */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-1">Backdrop:</span>
          {WALLPAPER_OPTIONS.map((wp) => {
            const active = wallpaperId === wp.id;
            return (
              <button
                key={wp.id}
                type="button"
                onClick={() => onChangeWallpaper(wp.id)}
                className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors min-h-[34px] whitespace-nowrap shrink-0 ${
                  active
                    ? 'border-emerald-400/70 bg-emerald-500/15 text-emerald-200 font-medium'
                    : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                {wp.name}
              </button>
            );
          })}
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 transition-colors min-h-[34px] whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {wallpaperId === 'custom' && customWallpaperUrl
                ? 'Change Wallpaper'
                : 'Test Your Wallpaper'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
