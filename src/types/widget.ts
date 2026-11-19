export type BudsColorway =
  | 'wintergreen'
  | 'iris'
  | 'hazel'
  | 'porcelain'
  | 'peony'
  | 'obsidian';

export type WallpaperId =
  | 'reference_navy'
  | 'pixel_iris'
  | 'pixel_obsidian'
  | 'pixel_sage'
  | 'pixel_dusk'
  | 'custom';

export interface BatteryState {
  left: number;
  caseLevel: number;
  right: number;
  leftCharging: boolean;
  caseCharging: boolean;
  rightCharging: boolean;
  caseLidOpen: boolean;
}

export interface WidgetTheme {
  id: string;
  name: string;
  bgColor: string;
  bgOpacity: number; // 0 to 100
  blurAmount: number; // 0 to 28 px
  borderOpacity: number; // 0 to 50
  ringColor: string;
  trackColor: string;
  trackOpacity: number; // 0 to 100
  innerDiscColor: string;
  innerDiscOpacity: number; // 0 to 100
  boltBgColor: string;
  boltIconColor: string;
  textColor: string;
  cornerRadius: number; // 0 to 36 px
  ringThickness: number; // 6 to 12 px
  budsColorway: BudsColorway;
  dynamicLowBattery: boolean;
  showChargingSubtext: boolean;
}

export interface SavedPreset {
  id: string;
  name: string;
  theme: WidgetTheme;
  createdAt: number;
}
