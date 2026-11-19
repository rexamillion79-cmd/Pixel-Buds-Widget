import { BatteryState, BudsColorway, WallpaperId, WidgetTheme } from '../types/widget';

export interface ColorwaySpec {
  id: BudsColorway;
  name: string;
  capBase: string;
  capHighlight: string;
  capShadow: string;
  wingColor: string;
  caseShell: string;
  caseShellShadow: string;
  caseInterior: string;
  logoColor: string;
}

export const BUDS_COLORWAYS: Record<BudsColorway, ColorwaySpec> = {
  wintergreen: {
    id: 'wintergreen',
    name: 'Wintergreen',
    capBase: '#bff5ca',
    capHighlight: '#dcfce3',
    capShadow: '#8ed89f',
    wingColor: '#1b2028',
    caseShell: '#f5f7f8',
    caseShellShadow: '#d9dfe5',
    caseInterior: '#161b22',
    logoColor: '#88c998',
  },
  iris: {
    id: 'iris',
    name: 'Iris',
    capBase: '#b8a9f5',
    capHighlight: '#d8cffc',
    capShadow: '#8c7ad6',
    wingColor: '#252136',
    caseShell: '#f4f2f8',
    caseShellShadow: '#dcd6eb',
    caseInterior: '#1c182b',
    logoColor: '#7e6bc4',
  },
  hazel: {
    id: 'hazel',
    name: 'Hazel',
    capBase: '#8c968e',
    capHighlight: '#abb5ad',
    capShadow: '#646e66',
    wingColor: '#202622',
    caseShell: '#eceee9',
    caseShellShadow: '#cfd4cc',
    caseInterior: '#1b201d',
    logoColor: '#5c665e',
  },
  porcelain: {
    id: 'porcelain',
    name: 'White',
    capBase: '#f7f8fa',
    capHighlight: '#ffffff',
    capShadow: '#d4dae3',
    wingColor: '#1f2329',
    caseShell: '#ffffff',
    caseShellShadow: '#e2e6ec',
    caseInterior: '#1a1d22',
    logoColor: '#9aa3b2',
  },
  peony: {
    id: 'peony',
    name: 'Peony',
    capBase: '#f3b2bf',
    capHighlight: '#fcd7de',
    capShadow: '#d48797',
    wingColor: '#2b1e22',
    caseShell: '#f9f3f5',
    caseShellShadow: '#e4d5da',
    caseInterior: '#22171b',
    logoColor: '#c27687',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian',
    capBase: '#343942',
    capHighlight: '#4c5361',
    capShadow: '#1e2229',
    wingColor: '#121418',
    caseShell: '#252930',
    caseShellShadow: '#15181d',
    caseInterior: '#0d0f13',
    logoColor: '#5e6675',
  },
};

export const THEME_PRESETS: WidgetTheme[] = [
  {
    id: 'exact-reference',
    name: 'Exact Reference',
    bgColor: '#0c1e3a',
    bgOpacity: 100,
    blurAmount: 0,
    borderOpacity: 0,
    ringColor: '#28d157',
    trackColor: '#1f3961',
    trackOpacity: 60,
    innerDiscColor: '#172c4d',
    innerDiscOpacity: 95,
    boltBgColor: '#28d157',
    boltIconColor: '#0b182c',
    textColor: '#e6edf7',
    cornerRadius: 28,
    ringThickness: 8.5,
    budsColorway: 'porcelain',
    dynamicLowBattery: false,
    showChargingSubtext: false,
  },
  {
    id: 'frosted-glass',
    name: 'Frosted Glass',
    bgColor: '#0f172a',
    bgOpacity: 42,
    blurAmount: 18,
    borderOpacity: 22,
    ringColor: '#34d399',
    trackColor: '#ffffff',
    trackOpacity: 18,
    innerDiscColor: '#0f172a',
    innerDiscOpacity: 45,
    boltBgColor: '#34d399',
    boltIconColor: '#052e16',
    textColor: '#f8fafc',
    cornerRadius: 28,
    ringThickness: 8.5,
    budsColorway: 'porcelain',
    dynamicLowBattery: true,
    showChargingSubtext: false,
  },
  {
    id: 'clear-transparent',
    name: 'Full Transparent',
    bgColor: '#000000',
    bgOpacity: 0,
    blurAmount: 0,
    borderOpacity: 0,
    ringColor: '#38bdf8',
    trackColor: '#ffffff',
    trackOpacity: 22,
    innerDiscColor: '#0b1324',
    innerDiscOpacity: 42,
    boltBgColor: '#38bdf8',
    boltIconColor: '#082f49',
    textColor: '#ffffff',
    cornerRadius: 28,
    ringThickness: 8.5,
    budsColorway: 'porcelain',
    dynamicLowBattery: true,
    showChargingSubtext: false,
  },
  {
    id: 'pixel-iris',
    name: 'Pixel 9 Iris',
    bgColor: '#1d1734',
    bgOpacity: 82,
    blurAmount: 14,
    borderOpacity: 18,
    ringColor: '#a78bfa',
    trackColor: '#3f3469',
    trackOpacity: 55,
    innerDiscColor: '#292147',
    innerDiscOpacity: 90,
    boltBgColor: '#a78bfa',
    boltIconColor: '#1b1138',
    textColor: '#ede9fe',
    cornerRadius: 28,
    ringThickness: 8.5,
    budsColorway: 'iris',
    dynamicLowBattery: true,
    showChargingSubtext: false,
  },
  {
    id: 'porcelain-daylight',
    name: 'Porcelain Light',
    bgColor: '#f4f1ea',
    bgOpacity: 88,
    blurAmount: 16,
    borderOpacity: 14,
    ringColor: '#1ea34a',
    trackColor: '#d6d1c4',
    trackOpacity: 75,
    innerDiscColor: '#e7e3d8',
    innerDiscOpacity: 95,
    boltBgColor: '#1ea34a',
    boltIconColor: '#ffffff',
    textColor: '#1c1b18',
    cornerRadius: 28,
    ringThickness: 8.5,
    budsColorway: 'porcelain',
    dynamicLowBattery: true,
    showChargingSubtext: false,
  },
  {
    id: 'hazel-matte',
    name: 'Hazel Matte',
    bgColor: '#1b201d',
    bgOpacity: 86,
    blurAmount: 12,
    borderOpacity: 15,
    ringColor: '#7be098',
    trackColor: '#323c36',
    trackOpacity: 65,
    innerDiscColor: '#252c28',
    innerDiscOpacity: 92,
    boltBgColor: '#7be098',
    boltIconColor: '#0e1a12',
    textColor: '#eef3ef',
    cornerRadius: 28,
    ringThickness: 8.5,
    budsColorway: 'hazel',
    dynamicLowBattery: true,
    showChargingSubtext: false,
  },
];

export interface BatteryScenario {
  id: string;
  label: string;
  description: string;
  state: BatteryState;
}

export const BATTERY_SCENARIOS: BatteryScenario[] = [
  {
    id: 'full-charged',
    label: 'Fully Charged (Image Match)',
    description: 'All three units at 100% with charging badges active',
    state: {
      left: 100,
      caseLevel: 100,
      right: 100,
      leftCharging: true,
      caseCharging: true,
      rightCharging: true,
      caseLidOpen: true,
    },
  },
  {
    id: 'case-charging',
    label: 'Case Plugged In',
    description: 'Case charging via USB-C while topping up both earbuds',
    state: {
      left: 64,
      caseLevel: 48,
      right: 68,
      leftCharging: true,
      caseCharging: true,
      rightCharging: true,
      caseLidOpen: false,
    },
  },
  {
    id: 'active-listening',
    label: 'Active Listening',
    description: 'Both earbuds out of case, discharging independently',
    state: {
      left: 82,
      caseLevel: 94,
      right: 76,
      leftCharging: false,
      caseCharging: false,
      rightCharging: false,
      caseLidOpen: true,
    },
  },
  {
    id: 'low-battery',
    label: 'Low Battery Reserve',
    description: 'Buds running low while case recharges on pad',
    state: {
      left: 14,
      caseLevel: 22,
      right: 11,
      leftCharging: false,
      caseCharging: true,
      rightCharging: false,
      caseLidOpen: false,
    },
  },
];

export interface WallpaperOption {
  id: WallpaperId;
  name: string;
  backgroundStyle: string;
}

export const WALLPAPER_OPTIONS: WallpaperOption[] = [
  {
    id: 'reference_navy',
    name: 'Reference Navy',
    backgroundStyle: 'linear-gradient(160deg, #0b1b34 0%, #0e2240 55%, #09172d 100%)',
  },
  {
    id: 'pixel_iris',
    name: 'Pixel 9 Iris',
    backgroundStyle:
      'radial-gradient(circle at 20% 20%, #7c67e8 0%, transparent 55%), radial-gradient(circle at 80% 70%, #37439c 0%, transparent 60%), linear-gradient(145deg, #1b1738 0%, #2c2459 50%, #141226 100%)',
  },
  {
    id: 'pixel_sage',
    name: 'Pixel Wintergreen',
    backgroundStyle:
      'radial-gradient(circle at 75% 25%, #3c8c64 0%, transparent 52%), radial-gradient(circle at 20% 80%, #1d5742 0%, transparent 58%), linear-gradient(165deg, #0c2119 0%, #143328 52%, #081510 100%)',
  },
  {
    id: 'pixel_obsidian',
    name: 'Obsidian Mesh',
    backgroundStyle:
      'radial-gradient(circle at 50% 35%, #2b3446 0%, transparent 62%), linear-gradient(180deg, #0e1117 0%, #161b24 55%, #090b10 100%)',
  },
  {
    id: 'pixel_dusk',
    name: 'Warm Dusk',
    backgroundStyle:
      'radial-gradient(circle at 30% 25%, #b5655c 0%, transparent 50%), radial-gradient(circle at 80% 75%, #475888 0%, transparent 55%), linear-gradient(155deg, #251c2e 0%, #36293d 55%, #161321 100%)',
  },
];
