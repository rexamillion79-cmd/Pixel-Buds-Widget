/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { X, Zap } from 'lucide-react';
import { UnitKind } from './components/BatteryRing';
import { BudsBatteryWidget } from './components/BudsBatteryWidget';
import { ControlStudio, StudioTab } from './components/ControlStudio';
import { Pixel9PreviewStage } from './components/Pixel9PreviewStage';
import {
  BATTERY_SCENARIOS,
  THEME_PRESETS,
  WALLPAPER_OPTIONS,
} from './constants/presets';
import {
  BatteryState,
  SavedPreset,
  WallpaperId,
  WidgetTheme,
} from './types/widget';

const STORAGE_THEME_KEY = 'pixel_buds_2a_widget_theme_v2';
const STORAGE_BATTERY_KEY = 'pixel_buds_2a_widget_battery_v1';
const STORAGE_PRESETS_KEY = 'pixel_buds_2a_widget_presets_v1';

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [battery, setBattery] = useState<BatteryState>(() =>
    readStoredJson<BatteryState>(STORAGE_BATTERY_KEY, BATTERY_SCENARIOS[0].state)
  );
  const [theme, setTheme] = useState<WidgetTheme>(() =>
    readStoredJson<WidgetTheme>(STORAGE_THEME_KEY, THEME_PRESETS[0])
  );
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>(() =>
    readStoredJson<SavedPreset[]>(STORAGE_PRESETS_KEY, [])
  );

  const [activeTab, setActiveTab] = useState<StudioTab>('battery');
  const [selectedUnit, setSelectedUnit] = useState<UnitKind | null>(null);
  const [wallpaperId, setWallpaperId] = useState<WallpaperId>('reference_navy');
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(theme));
    } catch {
      // Ignore storage quota errors
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BATTERY_KEY, JSON.stringify(battery));
    } catch {
      // Ignore storage quota errors
    }
  }, [battery]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRESETS_KEY, JSON.stringify(savedPresets));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedPresets]);

  const handleSelectUnitFromWidget = (unit: UnitKind) => {
    setSelectedUnit(unit);
    setActiveTab('battery');
  };

  const handleSavePreset = (name: string) => {
    const newPreset: SavedPreset = {
      id: `custom-${Date.now()}`,
      name,
      theme: { ...theme, id: `custom-${Date.now()}`, name },
      createdAt: Date.now(),
    };
    setSavedPresets((prev) => [newPreset, ...prev]);
  };

  const handleDeletePreset = (id: string) => {
    setSavedPresets((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetDefaults = () => {
    setBattery(BATTERY_SCENARIOS[0].state);
    setTheme(THEME_PRESETS[0]);
    setSelectedUnit(null);
    setWallpaperId('reference_navy');
  };

  const activeWallpaper = WALLPAPER_OPTIONS.find((w) => w.id === wallpaperId);
  const fullscreenBackground: React.CSSProperties =
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

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] text-slate-100">
      {/* Three-zone Top Bar Contract */}
      <header className="border-b border-white/10 bg-[#0b101b]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#preview"
            className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            BudsWidget Studio
          </a>

          <nav
            aria-label="Primary sections"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300"
          >
            <a
              href="#preview"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Widget Preview
            </a>
            <button
              type="button"
              onClick={() => setActiveTab('battery')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Battery & Charging
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('appearance')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Colors & Glass
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              Launch Widget
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main id="preview" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="max-w-2xl mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white [text-wrap:balance]">
            Pixel Buds 2a Battery Widget for Pixel 9
          </h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Individual Left, Case, and Right charge rings with live charging states, custom Material You colors, and adjustable glass transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Widget & Pixel 9 Preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <Pixel9PreviewStage
              battery={battery}
              theme={theme}
              selectedUnit={selectedUnit}
              onSelectUnit={handleSelectUnitFromWidget}
              wallpaperId={wallpaperId}
              customWallpaperUrl={customWallpaperUrl}
              onChangeWallpaper={setWallpaperId}
              onUploadWallpaper={(url) => {
                setCustomWallpaperUrl(url);
                setWallpaperId('custom');
              }}
              onOpenFullscreen={() => setIsFullscreen(true)}
            />
          </div>

          {/* Right Column: Interactive Controls */}
          <div className="lg:col-span-7">
            <ControlStudio
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              battery={battery}
              onChangeBattery={setBattery}
              theme={theme}
              onChangeTheme={setTheme}
              selectedUnit={selectedUnit}
              onSelectUnit={setSelectedUnit}
              savedPresets={savedPresets}
              onSavePreset={handleSavePreset}
              onDeletePreset={handleDeletePreset}
              onResetDefaults={handleResetDefaults}
            />
          </div>
        </div>
      </main>

      {/* Standalone Fullscreen Widget View */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Standalone Pixel Buds 2a Widget View"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 transition-all"
          style={fullscreenBackground}
        >
          <div className="w-full max-w-[520px]">
            <BudsBatteryWidget
              battery={battery}
              theme={theme}
              selectedUnit={selectedUnit}
              onSelectUnit={handleSelectUnitFromWidget}
            />
          </div>

          {/* Quick standalone actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                setBattery((prev) => ({ ...prev, caseCharging: !prev.caseCharging }))
              }
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-xl bg-slate-950/75 hover:bg-slate-900/90 text-white border border-white/15 backdrop-blur-md min-h-[44px]"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>
                {battery.caseCharging ? 'Case Charging: On' : 'Case Charging: Off'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-xl bg-white text-slate-950 hover:bg-slate-200 min-h-[44px]"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Close View</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
