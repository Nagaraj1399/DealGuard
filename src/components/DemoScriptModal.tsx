import React from 'react';
import {
  ShieldAlert,
  TrendingDown,
  Play,
  RotateCcw,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Award,
} from 'lucide-react';

interface DemoScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerBeat1: () => void;
  onTriggerBeat2: () => void;
  onReset: () => void;
}

export const DemoScriptModal: React.FC<DemoScriptModalProps> = ({
  isOpen,
  onClose,
  onTriggerBeat1,
  onTriggerBeat2,
  onReset,
}) => {
  if (!isOpen) return null;

  const beat1Text = 'Please transfer the booking amount to this UPI ID before I show you the flat';
  const beat2Text = "ok nvm I'll look elsewhere";

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-1">
              <Award className="h-4 w-4" />
              <span>Nexconn Build Challenge 2026 Submission</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              DealGuard — Demo Video Script & Judging Guide
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              "Every chat deal dies one of two ways — a scam, or a missed moment. Guardian Copilot watches for both."
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Beats Checklist */}
        <div className="my-6 space-y-6">
          {/* Beat 1 */}
          <div className="rounded-xl border border-rose-950/60 bg-neutral-950/70 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-900/60 text-xs font-bold text-rose-300">
                  1
                </span>
                <span className="text-sm font-bold text-white">
                  BEAT 1: Trust Shield Scam Detection
                </span>
              </div>
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                Live Red Warning Badge
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Tests P2P advance fee scam detection when seller or counterparty requests off-platform or unverified booking deposit before showing.
            </p>
            <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-2.5 text-xs font-mono text-neutral-200">
              <span className="truncate mr-2">"{beat1Text}"</span>
              <button
                onClick={() => copyToClipboard(beat1Text)}
                className="p-1 text-neutral-400 hover:text-white shrink-0"
                title="Copy text"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                Expected: Instant red warning pill on the bubble with scam pattern explanation.
              </span>
              <button
                onClick={() => {
                  onTriggerBeat1();
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
              >
                <Play className="h-3 w-3" />
                <span>Test Beat 1 Now</span>
              </button>
            </div>
          </div>

          {/* Beat 2 */}
          <div className="rounded-xl border border-amber-950/60 bg-neutral-950/70 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-900/60 text-xs font-bold text-amber-300">
                  2
                </span>
                <span className="text-sm font-bold text-white">
                  BEAT 2: Hot-Lead Radar Escalation & Audio Briefing
                </span>
              </div>
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                Proactive Audio Briefing
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Detects high walkaway risk ({'>'}80%) when buyer is about to disengage. Proactively alerts channel and synthesizes a spoken audio briefing for human broker.
            </p>
            <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-2.5 text-xs font-mono text-neutral-200">
              <span className="truncate mr-2">"{beat2Text}"</span>
              <button
                onClick={() => copyToClipboard(beat2Text)}
                className="p-1 text-neutral-400 hover:text-white shrink-0"
                title="Copy text"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                Expected: System notice in chat + playable audio briefing in /agent view.
              </span>
              <button
                onClick={() => {
                  onTriggerBeat2();
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
              >
                <Play className="h-3 w-3" />
                <span>Test Beat 2 Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Data</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
