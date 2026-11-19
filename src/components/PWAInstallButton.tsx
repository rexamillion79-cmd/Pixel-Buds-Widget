import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center gap-2 font-medium rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 ${
          compact ? 'px-3 py-1.5 text-xs min-h-[36px]' : 'px-4 py-2 text-xs min-h-[40px]'
        }`}
      >
        <Download className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Install on Phone</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className={`inline-flex items-center gap-2 font-medium rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
          compact ? 'px-3 py-1.5 text-xs min-h-[36px]' : 'px-4 py-2 text-xs min-h-[40px]'
        }`}
      >
        <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Install on Pixel 9</span>
      </button>

      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Install on Pixel 9"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/15 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-base font-semibold text-white">
                {isIOS ? 'Install on iPhone / iPad' : 'Install Directly on Pixel 9'}
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close installation guide"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                1. Tap the <strong>Share</strong> button in Safari.
                <br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
            ) : (
              <div className="mt-3 text-xs text-slate-300 space-y-2 leading-relaxed">
                <p>
                  This app is configured as an installable Android WebAPK:
                </p>
                <p>
                  1. Open this app URL directly in <strong>Chrome on your Pixel 9</strong> (outside an embedded preview frame).
                </p>
                <p>
                  2. Tap the Chrome menu (<strong>⋮</strong>) and choose <strong>Add to home screen</strong> &rarr; <strong>Install</strong> to install it on your phone like a native app.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full h-10 rounded-xl bg-white text-slate-950 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
