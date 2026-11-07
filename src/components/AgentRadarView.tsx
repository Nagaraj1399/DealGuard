import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Play,
  Pause,
  AlertTriangle,
  UserCheck,
  Shield,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Sparkles,
  PhoneCall,
  MessageSquare,
} from 'lucide-react';
import { Escalation, User, Message } from '../types.js';
import { takeoverEscalation } from '../api.js';

interface AgentRadarViewProps {
  escalations: Escalation[];
  activeUser: User;
  onNavigateToChat: (channelId: string) => void;
  onEscalationUpdated: () => void;
}

export const AgentRadarView: React.FC<AgentRadarViewProps> = ({
  escalations,
  activeUser,
  onNavigateToChat,
  onEscalationUpdated,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [speechSynthActive, setSpeechSynthActive] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const togglePlayAudio = (id: string, audioUrl: string, transcript: string) => {
    const audioEl = audioRefs.current[id];

    if (playingId === id) {
      if (audioEl) {
        audioEl.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingId(null);
      setSpeechSynthActive(null);
      return;
    }

    // Stop previous
    if (playingId && audioRefs.current[playingId]) {
      audioRefs.current[playingId]?.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setPlayingId(id);

    // Try playing the WAV stream
    if (audioEl) {
      audioEl.playbackRate = playbackSpeed;
      audioEl.play().catch((err) => {
        console.warn('WAV autoplay blocked or failed, falling back to Web Speech synthesis:', err);
        // Fallback to high-quality browser speech synthesis
        speakTranscript(id, transcript);
      });
    } else {
      speakTranscript(id, transcript);
    }
  };

  const speakTranscript = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackSpeed * 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setPlayingId(null);
      setSpeechSynthActive(null);
    };

    setSpeechSynthActive(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleTakeover = async (esc: Escalation) => {
    try {
      await takeoverEscalation(esc.id, esc.channelId, activeUser.id, activeUser.name);
      onEscalationUpdated();
      onNavigateToChat(esc.channelId);
    } catch (err) {
      console.error('Failed takeover:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Agent Priority Command Center · Guardian Copilot</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Hot-Lead Radar & Escalation Briefings
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Proactive voice briefings synthesized whenever buyer walkaway risk or closing intent exceeds 80%.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300">
            <span className="text-neutral-400">Viewing as:</span>
            <span className="font-semibold text-white">{activeUser.name}</span>
            <span className="text-[11px] text-amber-400">({activeUser.title})</span>
          </div>
        </div>
      </div>

      {/* Escalation Queue */}
      {escalations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/30 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 mb-4">
            <Sparkles className="h-6 w-6 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">No Active Escalations</h3>
          <p className="mt-1.5 max-w-md text-xs text-neutral-400">
            Guardian Copilot is monitoring active channels. Trigger Beat 2 in the chat thread to generate a live escalation audio briefing.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {escalations.map((esc) => {
            const isPlaying = playingId === esc.id;
            const isRisk = esc.triggerReason === 'risk_of_loss' || esc.riskOfLoss >= 80;

            return (
              <div
                key={esc.id}
                className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 transition-all hover:border-neutral-700"
              >
                {/* Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 bg-neutral-900/90 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        isRisk ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-emerald-400'
                      }`}
                    >
                      {isRisk ? (
                        <TrendingDown className="h-5 w-5" />
                      ) : (
                        <TrendingUp className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{esc.listingTitle}</span>
                        <span className="text-xs text-neutral-400">· Buyer: {esc.buyerName}</span>
                      </div>
                      <div className="text-xs text-neutral-400">
                        Seller: {esc.sellerName} · Logged {new Date(esc.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Badges / Metrics */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs">
                      <span className="text-neutral-400">Walkaway Risk:</span>
                      <span className="font-mono font-bold text-rose-400 tabular-nums">
                        {esc.riskOfLoss}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs">
                      <span className="text-neutral-400">Lead Score:</span>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">
                        {esc.leadScore}%
                      </span>
                    </div>

                    <div className="rounded-md bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300">
                      {esc.status === 'claimed' ? `Claimed by ${esc.claimedBy}` : 'Unclaimed'}
                    </div>
                  </div>
                </div>

                {/* Spoken Audio Briefing Card Body */}
                <div className="p-6">
                  <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Trigger Message:
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200 italic font-mono">
                      "{esc.lastMessageText}"
                    </div>
                  </div>

                  {/* Audio Briefing Player Box */}
                  <div className="rounded-xl border border-rose-950/40 bg-neutral-950/80 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePlayAudio(esc.id, esc.audioUrl, esc.briefingTranscript)}
                          className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-all ${
                            isPlaying
                              ? 'bg-rose-600 hover:bg-rose-500 ring-4 ring-rose-500/20'
                              : 'bg-white text-neutral-900 hover:bg-neutral-200'
                          }`}
                          title={isPlaying ? 'Pause spoken briefing' : 'Play spoken briefing'}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5 ml-0.5" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              Spoken AI Briefing for Agent
                            </span>
                            {isPlaying && (
                              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                            )}
                          </div>
                          <div className="text-xs text-neutral-400">
                            Synthesized voice summary · Guardian Copilot Real-Time TTS
                          </div>
                        </div>
                      </div>

                      {/* Speed & Speech Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakTranscript(esc.id, esc.briefingTranscript)}
                          className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white"
                          title="Speak via browser voice engine"
                        >
                          <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                          <span>TTS Voice</span>
                        </button>

                        <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 p-0.5 text-xs">
                          {[1.0, 1.25, 1.5].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => setPlaybackSpeed(speed)}
                              className={`rounded px-2 py-1 font-mono tabular-nums ${
                                playbackSpeed === speed
                                  ? 'bg-neutral-800 text-white'
                                  : 'text-neutral-400 hover:text-neutral-200'
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Hidden/Native Audio Element for WAV stream */}
                    <audio
                      ref={(el) => {
                        audioRefs.current[esc.id] = el;
                      }}
                      src={esc.audioUrl}
                      onEnded={() => setPlayingId(null)}
                      preload="auto"
                      className="w-full mt-2"
                      controls
                    />

                    {/* Waveform Visualization simulation */}
                    <div className="mt-4 flex h-6 items-center gap-1 px-1">
                      {Array.from({ length: 48 }).map((_, i) => {
                        const randomHeight = isPlaying
                          ? Math.max(20, Math.sin((i + Date.now() / 200) * 0.4) * 80 + 20)
                          : 15 + (i % 5) * 5;
                        return (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-150 ${
                              isPlaying ? 'bg-rose-500' : 'bg-neutral-800'
                            }`}
                            style={{ height: `${randomHeight}%` }}
                          />
                        );
                      })}
                    </div>

                    {/* Spoken Transcript */}
                    <div className="mt-4 border-t border-neutral-800/80 pt-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                        Spoken Briefing Transcript:
                      </div>
                      <p className="text-xs leading-relaxed text-neutral-300">
                        {esc.briefingTranscript}
                      </p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-neutral-400">
                        Direct Channel: <span className="text-neutral-200 font-mono">{esc.channelId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onNavigateToChat(esc.channelId)}
                        className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700 transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>View Chat Channel</span>
                      </button>

                      <button
                        onClick={() => handleTakeover(esc)}
                        className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors shadow-sm"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>Take Over Conversation</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
