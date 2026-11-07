import React from 'react';
import { Shield, Sparkles, UserCheck, RefreshCw, Radio } from 'lucide-react';
import { User } from '../types.js';

interface NavbarProps {
  currentView: 'listings' | 'chat' | 'agent' | 'demo';
  onNavigate: (view: 'listings' | 'chat' | 'agent' | 'demo') => void;
  activeUser: User | null;
  users: User[];
  onSelectUser: (user: User) => void;
  onResetDemo: () => void;
  activeEscalationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeUser,
  users,
  onSelectUser,
  onResetDemo,
  activeEscalationCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('listings')}
          className="group flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-rose-500 to-amber-600 text-white shadow-sm">
            <Shield className="h-4 w-4" />
          </div>
          <span>DealGuard</span>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-400">
          <button
            onClick={() => onNavigate('listings')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'listings' ? 'text-white' : 'hover:text-neutral-200'
            }`}
          >
            Listings
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'chat' ? 'text-white' : 'hover:text-neutral-200'
            }`}
          >
            Buyer↔Seller Chat
          </button>
          <button
            onClick={() => onNavigate('agent')}
            className={`relative flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'agent' ? 'text-white' : 'hover:text-neutral-200'
            }`}
          >
            <span>Agent Radar</span>
            {activeEscalationCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[11px] font-semibold text-white tabular-nums">
                {activeEscalationCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigate('demo')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'demo' ? 'text-white' : 'hover:text-neutral-200'
            }`}
          >
            Demo Script
          </button>
        </nav>

        {/* Zone 3: Role Switcher & Reset Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900/80 p-1 text-xs">
            <span className="hidden sm:inline-block px-2 text-neutral-400 font-medium">Role:</span>
            {users.map((u) => {
              const isActive = activeUser?.id === u.id;
              const roleLabel =
                u.role === 'buyer' ? 'Buyer' : u.role === 'seller' ? 'Seller' : 'Agent';
              return (
                <button
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title={`${u.name} (${u.title})`}
                >
                  {roleLabel}
                </button>
              );
            })}
          </div>

          <button
            onClick={onResetDemo}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors whitespace-nowrap"
            title="Reset messages and escalations to original demo seed state"
          >
            <RefreshCw className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden lg:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
