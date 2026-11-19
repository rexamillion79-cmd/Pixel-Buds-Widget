import React, { useState } from 'react';
import { Bluetooth, BookmarkPlus, RotateCcw, Trash2, Zap } from 'lucide-react';
import {
  BATTERY_SCENARIOS,
  BUDS_COLORWAYS,
  THEME_PRESETS,
} from '../constants/presets';
import {
  BatteryState,
  BudsColorway,
  SavedPreset,
  WidgetTheme,
} from '../types/widget';
import { hexToAndroidArgb } from '../utils/color';
import { UnitKind } from './BatteryRing';

export type StudioTab = 'battery' | 'appearance';

interface ControlStudioProps {
  activeTab: StudioTab;
  onChangeTab: (tab: StudioTab) => void;
  battery: BatteryState;
  onChangeBattery: (next: BatteryState) => void;
  theme: WidgetTheme;
  onChangeTheme: (next: WidgetTheme) => void;
  selectedUnit: UnitKind | null;
  onSelectUnit: (unit: UnitKind | null) => void;
  savedPresets: SavedPreset[];
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  onResetDefaults: () => void;
}

interface ColorControlProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const ColorControl: React.FC<ColorControlProps> = ({ label, value, onChange }) => (
  <label className="flex items-center justify-between gap-3 py-2 cursor-pointer">
    <span className="text-xs text-slate-300">{label}</span>
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-mono text-slate-400 uppercase tabular-nums">
        {value}
      </span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-8 h-8 rounded-lg border border-white/15 bg-transparent cursor-pointer p-0.5"
      />
    </div>
  </label>
);

export const ControlStudio: React.FC<ControlStudioProps> = ({
  activeTab,
  onChangeTab,
  battery,
  onChangeBattery,
  theme,
  onChangeTheme,
  selectedUnit,
  onSelectUnit,
  savedPresets,
  onSavePreset,
  onDeletePreset,
  onResetDefaults,
}) => {
  const [presetName, setPresetName] = useState('');
  const [btStatus, setBtStatus] = useState<string | null>(null);
  const [btScanning, setBtScanning] = useState(false);

  const updateTheme = <K extends keyof WidgetTheme>(key: K, val: WidgetTheme[K]) => {
    onChangeTheme({ ...theme, [key]: val });
  };

  const handleBluetoothProbe = async () => {
    const nav = navigator as Navigator & {
      bluetooth?: {
        requestDevice: (opts: {
          filters?: Array<{ services: Array<string | number> }>;
          optionalServices?: Array<string | number>;
          acceptAllDevices?: boolean;
        }) => Promise<{
          name?: string;
          gatt?: {
            connect: () => Promise<{
              getPrimaryService: (service: string | number) => Promise<{
                getCharacteristic: (char: string | number) => Promise<{
                  readValue: () => Promise<DataView>;
                }>;
              }>;
            }>;
          };
        }>;
      };
    };

    if (!nav.bluetooth) {
      setBtStatus(
        'Web Bluetooth is unavailable in this browser. Open in Chrome on Android/Desktop over HTTPS to probe BLE Battery Service (0x180F).'
      );
      return;
    }

    setBtScanning(true);
    setBtStatus('Scanning for Bluetooth Battery Service...');

    try {
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: ['battery_service'] }],
        optionalServices: ['battery_service'],
      });
      const server = await device.gatt?.connect();
      if (!server) {
        setBtStatus(`Paired with ${device.name || 'device'}, but GATT connection failed.`);
        setBtScanning(false);
        return;
      }
      const service = await server.getPrimaryService('battery_service');
      const char = await service.getCharacteristic('battery_level');
      const value = await char.readValue();
      const level = value.getUint8(0);
      onChangeBattery({
        ...battery,
        left: level,
        right: level,
      });
      setBtStatus(
        `Read ${level}% from ${device.name || 'Bluetooth device'}. Note: individual L/R/Case levels on Pixel Buds 2a use Android Fast Pair broadcasts outside standard Web Bluetooth.`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Scan cancelled';
      setBtStatus(
        `${msg}. Note: Pixel Buds 2a expose separate L/R/Case telemetry via Android Fast Pair rather than browser Web Bluetooth.`
      );
    } finally {
      setBtScanning(false);
    }
  };

  const handleSavePresetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = presetName.trim();
    if (!trimmed) return;
    onSavePreset(trimmed);
    setPresetName('');
  };

  return (
    <div className="flex flex-col rounded-3xl bg-slate-900/65 border border-white/10 p-5 sm:p-7">
      {/* Studio navigation tabs + reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
        <div
          role="tablist"
          aria-label="Widget configuration sections"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-white/10"
        >
          {(
            [
              ['battery', 'Battery & Charging'],
              ['appearance', 'Colors & Transparency'],
            ] as const
          ).map(([tabKey, label]) => (
            <button
              key={tabKey}
              type="button"
              role="tab"
              aria-selected={activeTab === tabKey}
              onClick={() => onChangeTab(tabKey)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[38px] ${
                activeTab === tabKey
                  ? 'bg-slate-100 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onResetDefaults}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors min-h-[38px] whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Reset to Reference</span>
        </button>
      </div>

      {/* TAB 1: BATTERY & CHARGING */}
      {activeTab === 'battery' && (
        <div className="flex flex-col gap-6 pt-5">
          {/* Quick scenarios */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2.5">
              Quick Battery & Charging States
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BATTERY_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => onChangeBattery(scenario.state)}
                  className="text-left px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-colors min-h-[44px]"
                >
                  <p className="text-xs font-semibold text-slate-100">
                    {scenario.label}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {scenario.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Individual Left / Case / Right Controls */}
          <div className="divide-y divide-white/10 border-t border-white/10">
            {/* LEFT EARBUD */}
            <div
              className={`py-4 transition-colors ${
                selectedUnit === 'left' ? 'bg-white/[0.03] -mx-3 px-3 rounded-xl' : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => onSelectUnit(selectedUnit === 'left' ? null : 'left')}
                  className="text-sm font-semibold text-slate-100 text-left"
                >
                  Left Earbud (L)
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold text-emerald-400 tabular-nums">
                    {battery.left}%
                  </span>
                  <button
                    type="button"
                    aria-pressed={battery.leftCharging}
                    onClick={() =>
                      onChangeBattery({ ...battery, leftCharging: !battery.leftCharging })
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors min-h-[36px] whitespace-nowrap shrink-0 ${
                      battery.leftCharging
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                        : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{battery.leftCharging ? 'Charging' : 'Not Charging'}</span>
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={battery.left}
                aria-label="Left earbud battery percentage"
                onChange={(e) =>
                  onChangeBattery({ ...battery, left: Number(e.target.value) })
                }
                className="w-full studio-slider"
              />
            </div>

            {/* CHARGING CASE */}
            <div
              className={`py-4 transition-colors ${
                selectedUnit === 'case' ? 'bg-white/[0.03] -mx-3 px-3 rounded-xl' : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => onSelectUnit(selectedUnit === 'case' ? null : 'case')}
                  className="text-sm font-semibold text-slate-100 text-left"
                >
                  Charging Case (C)
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-emerald-400 tabular-nums mr-1">
                    {battery.caseLevel}%
                  </span>
                  <button
                    type="button"
                    aria-pressed={battery.caseCharging}
                    onClick={() =>
                      onChangeBattery({ ...battery, caseCharging: !battery.caseCharging })
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors min-h-[36px] whitespace-nowrap shrink-0 ${
                      battery.caseCharging
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                        : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{battery.caseCharging ? 'Case Charging' : 'On Battery'}</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={battery.caseLidOpen}
                    onClick={() =>
                      onChangeBattery({ ...battery, caseLidOpen: !battery.caseLidOpen })
                    }
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 transition-colors min-h-[36px] whitespace-nowrap shrink-0"
                  >
                    {battery.caseLidOpen ? 'Lid Open' : 'Lid Closed'}
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={battery.caseLevel}
                aria-label="Charging case battery percentage"
                onChange={(e) =>
                  onChangeBattery({ ...battery, caseLevel: Number(e.target.value) })
                }
                className="w-full studio-slider"
              />
            </div>

            {/* RIGHT EARBUD */}
            <div
              className={`py-4 transition-colors ${
                selectedUnit === 'right' ? 'bg-white/[0.03] -mx-3 px-3 rounded-xl' : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => onSelectUnit(selectedUnit === 'right' ? null : 'right')}
                  className="text-sm font-semibold text-slate-100 text-left"
                >
                  Right Earbud (R)
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold text-emerald-400 tabular-nums">
                    {battery.right}%
                  </span>
                  <button
                    type="button"
                    aria-pressed={battery.rightCharging}
                    onClick={() =>
                      onChangeBattery({
                        ...battery,
                        rightCharging: !battery.rightCharging,
                      })
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors min-h-[36px] whitespace-nowrap shrink-0 ${
                      battery.rightCharging
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                        : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{battery.rightCharging ? 'Charging' : 'Not Charging'}</span>
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={battery.right}
                aria-label="Right earbud battery percentage"
                onChange={(e) =>
                  onChangeBattery({ ...battery, right: Number(e.target.value) })
                }
                className="w-full studio-slider"
              />
            </div>
          </div>

          {/* Web Bluetooth live battery probe */}
          <div className="border-t border-white/10 pt-4 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-200">
                  Bluetooth Battery Probe
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Reads standard BLE Battery Service (0x180F) when supported by browser
                </p>
              </div>
              <button
                type="button"
                onClick={handleBluetoothProbe}
                disabled={btScanning}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-50 text-slate-100 border border-white/10 transition-colors min-h-[40px] whitespace-nowrap shrink-0"
              >
                <Bluetooth className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{btScanning ? 'Scanning...' : 'Connect Bluetooth'}</span>
              </button>
            </div>
            {btStatus && (
              <p className="text-xs text-slate-300 bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2.5 leading-relaxed">
                {btStatus}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COLORS & TRANSPARENCY */}
      {activeTab === 'appearance' && (
        <div className="flex flex-col gap-6 pt-5">
          {/* Theme Presets */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2.5">
              Curated Widget Themes
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEME_PRESETS.map((preset) => {
                const isActive = theme.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onChangeTheme({ ...preset })}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors min-h-[44px] ${
                      isActive
                        ? 'border-emerald-400/70 bg-emerald-500/10 text-white'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-slate-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="w-4 h-4 rounded-full shrink-0 border border-white/25"
                      style={{
                        backgroundColor: preset.bgColor,
                        boxShadow: `inset 0 0 0 3px ${preset.ringColor}`,
                      }}
                    />
                    <span className="text-xs font-medium truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transparency & Surface Geometry */}
          <div className="border-t border-white/10 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-100">
                Background & Transparency
              </p>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                {hexToAndroidArgb(theme.bgColor, theme.bgOpacity)}
              </span>
            </div>

            <ColorControl
              label="Widget Background Color"
              value={theme.bgColor}
              onChange={(val) => updateTheme('bgColor', val)}
            />

            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-300">Background Opacity</span>
                <span className="font-mono text-slate-100 tabular-nums">
                  {theme.bgOpacity}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={theme.bgOpacity}
                aria-label="Background opacity percentage"
                onChange={(e) => updateTheme('bgOpacity', Number(e.target.value))}
                className="w-full studio-slider"
              />
              <div className="flex items-center gap-2 mt-2.5">
                {[
                  ['0% Clear', 0],
                  ['35% Glass', 35],
                  ['75% Tint', 75],
                  ['100% Solid', 100],
                ].map(([label, val]) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => updateTheme('bgOpacity', Number(val))}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors min-h-[30px] whitespace-nowrap shrink-0 ${
                      theme.bgOpacity === val
                        ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300">Backdrop Blur</span>
                  <span className="font-mono text-slate-100 tabular-nums">
                    {theme.blurAmount}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={28}
                  value={theme.blurAmount}
                  aria-label="Backdrop blur in pixels"
                  onChange={(e) => updateTheme('blurAmount', Number(e.target.value))}
                  className="w-full studio-slider"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300">Corner Radius</span>
                  <span className="font-mono text-slate-100 tabular-nums">
                    {theme.cornerRadius}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={36}
                  value={theme.cornerRadius}
                  aria-label="Corner radius in pixels"
                  onChange={(e) => updateTheme('cornerRadius', Number(e.target.value))}
                  className="w-full studio-slider"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-300">Glass Border Opacity</span>
                <span className="font-mono text-slate-100 tabular-nums">
                  {theme.borderOpacity}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={theme.borderOpacity}
                aria-label="Glass border opacity"
                onChange={(e) => updateTheme('borderOpacity', Number(e.target.value))}
                className="w-full studio-slider"
              />
            </div>
          </div>

          {/* Ring, Inner Disc, Bolt & Text Colors */}
          <div className="border-t border-white/10 pt-5 space-y-2">
            <p className="text-xs font-semibold text-slate-100 mb-1">
              Ring, Badge & Label Colors
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <ColorControl
                label="Ring Fill Color"
                value={theme.ringColor}
                onChange={(val) => updateTheme('ringColor', val)}
              />
              <ColorControl
                label="Ring Track Color"
                value={theme.trackColor}
                onChange={(val) => updateTheme('trackColor', val)}
              />
              <ColorControl
                label="Inner Circle Tint"
                value={theme.innerDiscColor}
                onChange={(val) => updateTheme('innerDiscColor', val)}
              />
              <ColorControl
                label="Lightning Badge"
                value={theme.boltBgColor}
                onChange={(val) => updateTheme('boltBgColor', val)}
              />
              <ColorControl
                label="Lightning Bolt Icon"
                value={theme.boltIconColor}
                onChange={(val) => updateTheme('boltIconColor', val)}
              />
              <ColorControl
                label="Percentage Text"
                value={theme.textColor}
                onChange={(val) => updateTheme('textColor', val)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300">Track Opacity</span>
                  <span className="font-mono text-slate-100 tabular-nums">
                    {theme.trackOpacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={theme.trackOpacity}
                  aria-label="Ring track opacity"
                  onChange={(e) => updateTheme('trackOpacity', Number(e.target.value))}
                  className="w-full studio-slider"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300">Inner Disc Opacity</span>
                  <span className="font-mono text-slate-100 tabular-nums">
                    {theme.innerDiscOpacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={theme.innerDiscOpacity}
                  aria-label="Inner disc opacity"
                  onChange={(e) =>
                    updateTheme('innerDiscOpacity', Number(e.target.value))
                  }
                  className="w-full studio-slider"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300">Ring Thickness</span>
                  <span className="font-mono text-slate-100 tabular-nums">
                    {theme.ringThickness}px
                  </span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={12}
                  step={0.5}
                  value={theme.ringThickness}
                  aria-label="Ring stroke thickness"
                  onChange={(e) => updateTheme('ringThickness', Number(e.target.value))}
                  className="w-full studio-slider"
                />
              </div>
            </div>
          </div>

          {/* Pixel Buds 2a Hardware Colorway */}
          <div className="border-t border-white/10 pt-5">
            <p className="text-xs font-semibold text-slate-100 mb-2.5">
              Pixel Buds 2a Colorway
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(Object.keys(BUDS_COLORWAYS) as BudsColorway[]).map((key) => {
                const spec = BUDS_COLORWAYS[key];
                const selected = theme.budsColorway === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateTheme('budsColorway', key)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition-colors min-h-[54px] ${
                      selected
                        ? 'border-emerald-400/70 bg-emerald-500/10 text-white'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-slate-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="w-5 h-5 rounded-full border border-white/25"
                      style={{ backgroundColor: spec.capBase }}
                    />
                    <span className="text-[11px] font-medium truncate max-w-full">
                      {spec.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smart behavior toggles */}
          <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
            <label className="flex items-center justify-between gap-3 cursor-pointer py-1">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  Dynamic Low-Battery Color
                </span>
                <span className="text-[11px] text-slate-400">
                  Shifts ring to amber below 30% and red below 15%
                </span>
              </div>
              <input
                type="checkbox"
                checked={theme.dynamicLowBattery}
                onChange={(e) => updateTheme('dynamicLowBattery', e.target.checked)}
                className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer py-1">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  Show Charging Status Subtext
                </span>
                <span className="text-[11px] text-slate-400">
                  Display Charging / Standby labels beneath L, C, and R percentages
                </span>
              </div>
              <input
                type="checkbox"
                checked={theme.showChargingSubtext}
                onChange={(e) => updateTheme('showChargingSubtext', e.target.checked)}
                className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Save Custom Preset */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <p className="text-xs font-semibold text-slate-100">
              Saved Custom Presets
            </p>
            <form onSubmit={handleSavePresetSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name (e.g. Night Glass 35%)"
                className="flex-1 h-10 px-3.5 text-xs rounded-xl bg-slate-950/80 border border-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/60"
              />
              <button
                type="submit"
                disabled={!presetName.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 h-10 text-xs font-medium rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 transition-colors whitespace-nowrap shrink-0"
              >
                <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Save</span>
              </button>
            </form>

            {savedPresets.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {savedPresets.map((item) => (
                  <div
                    key={item.id}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] pl-3 pr-1.5 py-1"
                  >
                    <button
                      type="button"
                      onClick={() => onChangeTheme({ ...item.theme })}
                      className="text-xs text-slate-200 hover:text-white py-1"
                    >
                      {item.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePreset(item.id)}
                      aria-label={`Delete preset ${item.name}`}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
