import React, { useState } from 'react';
import { Check, Copy, Download, FolderArchive } from 'lucide-react';
import { BatteryState, WidgetTheme } from '../types/widget';
import { buildAndroidStudioProjectZip } from '../utils/androidProjectZip';
import { hexToAndroidArgb } from '../utils/color';
import { PWAInstallButton } from './PWAInstallButton';

interface Pixel9ExportPanelProps {
  battery: BatteryState;
  theme: WidgetTheme;
}

type ExportFormat = 'kwgt' | 'android' | 'json';

export const Pixel9ExportPanel: React.FC<Pixel9ExportPanelProps> = ({
  battery,
  theme,
}) => {
  const [format, setFormat] = useState<ExportFormat>('kwgt');
  const [copied, setCopied] = useState(false);
  const [downloadingApkZip, setDownloadingApkZip] = useState(false);

  const bgArgb = hexToAndroidArgb(theme.bgColor, theme.bgOpacity);
  const trackArgb = hexToAndroidArgb(theme.trackColor, theme.trackOpacity);
  const discArgb = hexToAndroidArgb(theme.innerDiscColor, theme.innerDiscOpacity);
  const ringArgb = hexToAndroidArgb(theme.ringColor, 100);
  const textArgb = hexToAndroidArgb(theme.textColor, 100);

  const kwgtSpec = `// KWGT Pixel Buds 2a Widget Configuration
// Container Shape (Rectangle)
Background ARGB : ${bgArgb}
Corner Radius   : ${theme.cornerRadius}dp
Blur Radius     : ${theme.blurAmount}px

// Ring Arcs (Left, Case, Right)
Ring Color      : ${ringArgb}
Track Color     : ${trackArgb}
Inner Disc      : ${discArgb}
Bolt Badge      : ${hexToAndroidArgb(theme.boltBgColor, 100)}
Text Color      : ${textArgb}
Stroke Width    : ${theme.ringThickness}

// KWGT Ring Sweep Formulas (using Tasker/Bluetooth variables)
Left Sweep      : $if(br(tasker, buds_l_chg)=1, 316, 360) * (br(tasker, buds_l)/100)$
Case Sweep      : $if(br(tasker, buds_c_chg)=1, 316, 360) * (br(tasker, buds_c)/100)$
Right Sweep     : $if(br(tasker, buds_r_chg)=1, 316, 360) * (br(tasker, buds_r)/100)$

// Labels
Left Label      : L: $br(tasker, buds_l)$%
Case Label      : C: $br(tasker, buds_c)$%
Right Label     : R: $br(tasker, buds_r)$%`;

  const androidGlanceCode = `// Native AppWidget Colors (Included in the Android APK Project ZIP)
object BudsWidgetThemeConfig {
    val backgroundColor = Color(${bgArgb.replace('#', '0x')})
    val cornerRadius = ${theme.cornerRadius}.dp
    val ringColor = Color(${ringArgb.replace('#', '0x')})
    val trackColor = Color(${trackArgb.replace('#', '0x')})
    val innerDiscColor = Color(${discArgb.replace('#', '0x')})
    val boltBadgeColor = Color(${hexToAndroidArgb(theme.boltBgColor, 100).replace('#', '0x')})
    val textColor = Color(${textArgb.replace('#', '0x')})
    val ringStrokeDp = ${theme.ringThickness}.dp
}

// Current State Preview
// Left: ${battery.left}% (charging=${battery.leftCharging})
// Case: ${battery.caseLevel}% (charging=${battery.caseCharging})
// Right: ${battery.right}% (charging=${battery.rightCharging})`;

  const jsonSpec = JSON.stringify(
    {
      device: 'Pixel 9',
      accessories: 'Pixel Buds 2a',
      battery,
      theme: {
        ...theme,
        androidArgb: {
          background: bgArgb,
          track: trackArgb,
          innerDisc: discArgb,
          ring: ringArgb,
          text: textArgb,
        },
      },
    },
    null,
    2
  );

  const activeSnippet =
    format === 'kwgt' ? kwgtSpec : format === 'android' ? androidGlanceCode : jsonSpec;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonSpec], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel-buds-2a-widget-${theme.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAndroidZip = async () => {
    setDownloadingApkZip(true);
    try {
      const originUrl =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : 'https://budswidget.app';
      const blob = await buildAndroidStudioProjectZip(battery, theme, originUrl);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pixel-buds-2a-widget-android-apk-project.zip';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingApkZip(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Direct Phone Install + Android APK Project Download */}
      <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Install on Your Pixel 9 or Build APK
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Install immediately as an Android WebAPK via Chrome, or export the complete Android Studio / Gradle project (including a native Home Screen <code className="font-mono text-slate-200">AppWidgetProvider</code> and GitHub Actions APK builder).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <PWAInstallButton />

          <button
            type="button"
            onClick={handleDownloadAndroidZip}
            disabled={downloadingApkZip}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-white text-slate-950 hover:bg-slate-200 disabled:opacity-50 transition-colors min-h-[40px] whitespace-nowrap shrink-0"
          >
            <FolderArchive className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {downloadingApkZip
                ? 'Packaging Project...'
                : 'Download Android APK Project (.zip)'}
            </span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
          Because this web sandbox runs Node.js without the Android SDK / Gradle toolchain, a signed binary <code className="font-mono text-slate-300">.apk</code> cannot be compiled inside the browser environment. The downloaded ZIP includes <code className="font-mono text-slate-300">BudsWidgetProvider.kt</code>, <code className="font-mono text-slate-300">MainActivity.kt</code>, your case icon asset, and <code className="font-mono text-slate-300">.github/workflows/build-apk.yml</code> to compile <code className="font-mono text-slate-300">app-debug.apk</code> in Android Studio or GitHub Actions.
        </p>
      </div>

      {/* Format switch for KWGT / Kotlin / JSON */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-white/10">
          {(
            [
              ['kwgt', 'KWGT Spec'],
              ['android', 'Android Colors'],
              ['json', 'Theme JSON'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFormat(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                format === key
                  ? 'bg-slate-100 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors min-h-[38px] whitespace-nowrap shrink-0"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10 transition-colors min-h-[38px] whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Save JSON</span>
          </button>
        </div>
      </div>

      {/* Code block */}
      <pre className="w-full overflow-x-auto rounded-2xl bg-[#070b13] border border-white/10 p-4 text-xs font-mono text-slate-300 leading-relaxed">
        <code>{activeSnippet}</code>
      </pre>
    </div>
  );
};
