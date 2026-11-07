import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Send,
  Sparkles,
  AlertTriangle,
  User as UserIcon,
  Phone,
  Info,
  Radio,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Volume2,
} from 'lucide-react';
import { Listing, Message, User } from '../types.js';
import { sendMessage } from '../api.js';

interface ChatViewProps {
  listing: Listing;
  activeUser: User;
  messages: Message[];
  onMessageSent: (newMsg: Message, classification: any, escalation: any) => void;
  onNavigateToAgent: () => void;
  nexconnStatus: { connected: boolean; token: string; mode: string };
}

export const ChatView: React.FC<ChatViewProps> = ({
  listing,
  activeUser,
  messages,
  onMessageSent,
  onNavigateToAgent,
  nexconnStatus,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Compute latest radar stats
  const latestClassification = [...messages]
    .reverse()
    .find((m) => m.classification)?.classification || {
    trust_flag: false,
    trust_reason: null,
    lead_score: 68,
    risk_of_loss: 18,
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    setIsSending(true);
    setInputText('');

    try {
      const channelId = `channel_alex_priya`;
      const res = await sendMessage(channelId, {
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderRole: activeUser.role,
        content: text.trim(),
        listingId: listing.id,
      });

      onMessageSent(res.message, res.classification, res.escalation);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Demo script beats
  const demoBeat1Text = 'Please transfer the booking amount to this UPI ID before I show you the flat';
  const demoBeat2Text = "ok nvm I'll look elsewhere";

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
      {/* Top Channel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 bg-neutral-900/90 px-6 py-3.5 rounded-t-xl">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 font-semibold">
              {listing.sellerName.substring(0, 2).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-neutral-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{listing.sellerName}</span>
              <span className="text-xs text-neutral-400">· Listing Agent</span>
            </div>
            <div className="text-xs text-neutral-400">
              Inquiry on <span className="text-neutral-200 font-medium">{listing.title}</span> ({listing.formattedPrice})
            </div>
          </div>
        </div>

        {/* Nexconn & Copilot Status Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-400">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-neutral-300">
              Nexconn IM: {nexconnStatus.mode === 'live' ? 'Live Gateway' : 'Verified Sandbox'}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-rose-950/60 bg-rose-950/20 px-3 py-1.5 text-xs text-rose-300">
            <Sparkles className="h-3 w-3 text-rose-400" />
            <span>Guardian Copilot Active</span>
          </div>
        </div>
      </div>

      {/* Main Chat Layout Split: Messages on Left, Hot-Lead Radar on Right */}
      <div className="flex flex-1 overflow-hidden border-x border-neutral-800 bg-neutral-950/80">
        {/* Left: Message Thread */}
        <div className="flex flex-1 flex-col justify-between overflow-hidden">
          {/* Scrollable messages area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Top context card */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3.5 text-xs text-neutral-400">
              <div className="flex items-center justify-between font-medium text-neutral-200 mb-1">
                <span>{listing.title} · {listing.locality}</span>
                <span className="font-mono tabular-nums text-white">{listing.formattedPrice}</span>
              </div>
              <p className="line-clamp-1 text-neutral-400">{listing.description}</p>
            </div>

            {/* Messages Loop */}
            {messages.map((msg) => {
              const isSender = msg.senderId === activeUser.id;
              const isSystem = msg.isSystemNotice || msg.senderRole === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-3">
                    <div className="flex items-center gap-2 rounded-lg border border-amber-900/40 bg-amber-950/20 px-4 py-2 text-xs text-amber-200">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>{msg.content}</span>
                      <button
                        onClick={onNavigateToAgent}
                        className="ml-2 font-semibold underline hover:text-amber-100 whitespace-nowrap"
                      >
                        View in Agent Radar →
                      </button>
                    </div>
                  </div>
                );
              }

              const hasTrustFlag = msg.trustFlag || msg.classification?.trust_flag;
              const trustReason = msg.trustReason || msg.classification?.trust_reason;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-baseline gap-2 mb-1 px-1">
                    <span className="text-xs font-semibold text-neutral-300">
                      {msg.senderName}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="relative max-w-lg sm:max-w-xl">
                    {/* The message bubble */}
                    <div
                      className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all ${
                        isSender
                          ? 'bg-neutral-800 text-neutral-100 rounded-tr-xs'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-tl-xs'
                      } ${hasTrustFlag ? 'border-rose-600/80 ring-1 ring-rose-500/30' : ''}`}
                    >
                      {msg.content}

                      {/* Live Trust Shield Warning Badge */}
                      {hasTrustFlag && (
                        <div className="mt-2.5 pt-2 border-t border-rose-900/60">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveTooltipId(activeTooltipId === msg.id ? null : msg.id)
                            }
                            className="flex items-center gap-1.5 rounded-full bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors"
                          >
                            <ShieldAlert className="h-3.5 w-3.5 text-rose-400 shrink-0 animate-pulse" />
                            <span>Trust Shield Warning</span>
                          </button>

                          {/* Expanded warning explanation */}
                          <div className="mt-2 rounded-md bg-rose-950/40 border border-rose-800/40 p-2 text-xs text-rose-200 leading-normal">
                            <div className="font-semibold text-rose-300 mb-0.5">Potential P2P Scam Flagged:</div>
                            <div>{trustReason || 'Advance payment request detected prior to viewing.'}</div>
                            <div className="mt-1 text-[11px] text-rose-400/90 font-medium">
                              Recommendation: Never wire funds or transfer UPI deposits before verified in-person tour.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Demo Replay Trigger Bar (Hackathon Section 8) */}
          <div className="border-t border-neutral-800/80 bg-neutral-900/70 px-4 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-neutral-400">
                1-Click Video Demo Triggers:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleSend(demoBeat1Text)}
                  disabled={isSending}
                  className="flex items-center gap-1.5 rounded-md border border-rose-900/80 bg-rose-950/40 px-3 py-1 text-xs font-medium text-rose-300 hover:bg-rose-900/50 transition-colors whitespace-nowrap"
                  title="Scripted Beat 1: Requests booking amount before flat showing"
                >
                  <ShieldAlert className="h-3 w-3 text-rose-400" />
                  <span>Beat 1: Trigger Trust Shield Scam Flag</span>
                </button>
                <button
                  onClick={() => handleSend(demoBeat2Text)}
                  disabled={isSending}
                  className="flex items-center gap-1.5 rounded-md border border-amber-900/80 bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-300 hover:bg-amber-900/50 transition-colors whitespace-nowrap"
                  title="Scripted Beat 2: Disengagement walkaway triggers escalation briefing"
                >
                  <TrendingDown className="h-3 w-3 text-amber-400" />
                  <span>Beat 2: Trigger Hot-Lead Walkaway Radar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Chat Input Box */}
          <div className="border-t border-neutral-800 bg-neutral-900/90 p-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder={`Type a message as ${activeUser.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-600 focus:outline-hidden"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isSending}
                className="flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Send className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Real-Time Guardian Copilot Radar */}
        <div className="hidden lg:flex w-80 flex-col border-l border-neutral-800 bg-neutral-900/40 p-5 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-800">
            <Sparkles className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Guardian Copilot Radar</h3>
          </div>

          {/* Live Intent Score Cards */}
          <div className="space-y-4">
            {/* Lead Readiness Score */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-400">Lead Readiness</span>
                <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                  {latestClassification.lead_score}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${latestClassification.lead_score}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-neutral-400">
                Buyer commitment and booking intent evaluated on each turn.
              </p>
            </div>

            {/* Risk of Loss / Walkaway Radar */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-400">Walkaway Risk</span>
                <span
                  className={`text-xs font-mono font-bold tabular-nums ${
                    latestClassification.risk_of_loss >= 80 ? 'text-rose-400' : 'text-neutral-300'
                  }`}
                >
                  {latestClassification.risk_of_loss}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    latestClassification.risk_of_loss >= 80 ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${latestClassification.risk_of_loss}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-neutral-400">
                Escalates to human broker team when risk exceeds 80%.
              </p>
            </div>

            {/* Trust Shield Status */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span className="text-xs font-bold text-white">Trust Shield Status</span>
              </div>
              <p className="text-xs text-neutral-300">
                Scans for advance fees, wire transfer spoofing, and off-platform coercion before money changes hands.
              </p>
            </div>

            {/* Agent Link CTA */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-1.5">
                <Volume2 className="h-4 w-4 text-amber-400" />
                <span>Agent Escalation Channel</span>
              </div>
              <p className="text-xs text-neutral-400 mb-3">
                When deals heat up or threaten to walk, spoken audio briefings stream to Sarah Jenkins.
              </p>
              <button
                onClick={onNavigateToAgent}
                className="w-full rounded-lg bg-neutral-800 hover:bg-neutral-700 py-2 text-xs font-semibold text-white transition-colors"
              >
                Open Agent View →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
