import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { ListingsView } from './components/ListingsView.js';
import { ChatView } from './components/ChatView.js';
import { AgentRadarView } from './components/AgentRadarView.js';
import { DemoScriptModal } from './components/DemoScriptModal.js';
import {
  fetchListings,
  fetchUsers,
  fetchMessages,
  fetchEscalations,
  sendMessage,
  resetDatabase,
  issueNexconnToken,
} from './api.js';
import { Listing, User, Message, Escalation } from './types.js';

export default function App() {
  const [currentView, setCurrentView] = useState<'listings' | 'chat' | 'agent' | 'demo'>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [nexconnStatus, setNexconnStatus] = useState<{ connected: boolean; token: string; mode: string }>({
    connected: true,
    token: 'nc_init',
    mode: 'sandbox',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [loadedListings, loadedUsers, loadedEscalations] = await Promise.all([
          fetchListings(),
          fetchUsers(),
          fetchEscalations(),
        ]);

        setListings(loadedListings);
        setUsers(loadedUsers);
        setEscalations(loadedEscalations);

        const defaultBuyer = loadedUsers.find((u) => u.role === 'buyer') || loadedUsers[0];
        setActiveUser(defaultBuyer);

        const defaultListing = loadedListings[0];
        setSelectedListing(defaultListing);

        if (defaultListing) {
          const channelId = 'channel_alex_priya';
          const msgs = await fetchMessages(channelId);
          setMessages(msgs);
        }

        // Initialize Nexconn Token
        if (defaultBuyer) {
          try {
            const tokenRes = await issueNexconnToken(defaultBuyer.id);
            setNexconnStatus({
              connected: tokenRes.isOk,
              token: tokenRes.token,
              mode: tokenRes.isMock ? 'sandbox' : 'live',
            });
          } catch (err) {
            console.warn('Nexconn token initial setup:', err);
          }
        }
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleOpenChat = async (listing: Listing) => {
    setSelectedListing(listing);
    setCurrentView('chat');
    try {
      const channelId = 'channel_alex_priya';
      const msgs = await fetchMessages(channelId);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to fetch channel messages:', err);
    }
  };

  const handleMessageSent = (newMsg: Message, classification: any, escalation: Escalation | null) => {
    setMessages((prev) => [...prev, newMsg]);

    // If an escalation occurred, update escalations list and add system message to UI if present
    if (escalation) {
      setEscalations((prev) => [escalation, ...prev.filter((e) => e.id !== escalation.id)]);
      // Re-fetch messages after short delay to capture the system notice
      setTimeout(async () => {
        try {
          const msgs = await fetchMessages(newMsg.channelId);
          setMessages(msgs);
        } catch (err) {
          console.error(err);
        }
      }, 200);
    }
  };

  const handleResetDemo = async () => {
    try {
      await resetDatabase();
      const [loadedListings, loadedEscalations, msgs] = await Promise.all([
        fetchListings(),
        fetchEscalations(),
        fetchMessages('channel_alex_priya'),
      ]);
      setListings(loadedListings);
      setEscalations(loadedEscalations);
      setMessages(msgs);
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const handleTriggerBeat1 = async () => {
    setCurrentView('chat');
    if (!selectedListing && listings.length > 0) {
      setSelectedListing(listings[0]);
    }
    const buyerUser = users.find((u) => u.role === 'buyer') || activeUser;
    if (buyerUser) {
      setActiveUser(buyerUser);
      const text = 'Please transfer the booking amount to this UPI ID before I show you the flat';
      try {
        const res = await sendMessage('channel_alex_priya', {
          senderId: buyerUser.id,
          senderName: buyerUser.name,
          senderRole: 'buyer',
          content: text,
          listingId: selectedListing?.id || listings[0]?.id,
        });
        handleMessageSent(res.message, res.classification, res.escalation);
      } catch (err) {
        console.error('Error triggering Beat 1:', err);
      }
    }
  };

  const handleTriggerBeat2 = async () => {
    setCurrentView('chat');
    if (!selectedListing && listings.length > 0) {
      setSelectedListing(listings[0]);
    }
    const buyerUser = users.find((u) => u.role === 'buyer') || activeUser;
    if (buyerUser) {
      setActiveUser(buyerUser);
      const text = "ok nvm I'll look elsewhere";
      try {
        const res = await sendMessage('channel_alex_priya', {
          senderId: buyerUser.id,
          senderName: buyerUser.name,
          senderRole: 'buyer',
          content: text,
          listingId: selectedListing?.id || listings[0]?.id,
        });
        handleMessageSent(res.message, res.classification, res.escalation);
      } catch (err) {
        console.error('Error triggering Beat 2:', err);
      }
    }
  };

  const handleUserSelect = (user: User) => {
    setActiveUser(user);
    if (user.role === 'agent') {
      setCurrentView('agent');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          <span className="text-xs font-medium">Initializing DealGuard Copilot...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'demo') {
            setIsDemoModalOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        activeUser={activeUser}
        users={users}
        onSelectUser={handleUserSelect}
        onResetDemo={handleResetDemo}
        activeEscalationCount={escalations.filter((e) => e.status === 'active').length}
      />

      <main className="flex-1">
        {currentView === 'listings' && (
          <ListingsView
            listings={listings}
            activeUser={activeUser}
            onOpenChat={handleOpenChat}
            onOpenDemoGuide={() => setIsDemoModalOpen(true)}
          />
        )}

        {currentView === 'chat' && selectedListing && activeUser && (
          <ChatView
            listing={selectedListing}
            activeUser={activeUser}
            messages={messages}
            onMessageSent={handleMessageSent}
            onNavigateToAgent={() => {
              const agentUser = users.find((u) => u.role === 'agent');
              if (agentUser) setActiveUser(agentUser);
              setCurrentView('agent');
            }}
            nexconnStatus={nexconnStatus}
          />
        )}

        {currentView === 'agent' && (
          <AgentRadarView
            escalations={escalations}
            activeUser={activeUser?.role === 'agent' ? activeUser : users.find((u) => u.role === 'agent') || activeUser!}
            onNavigateToChat={(channelId) => {
              setCurrentView('chat');
            }}
            onEscalationUpdated={async () => {
              const updated = await fetchEscalations();
              setEscalations(updated);
            }}
          />
        )}
      </main>

      <DemoScriptModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onTriggerBeat1={handleTriggerBeat1}
        onTriggerBeat2={handleTriggerBeat2}
        onReset={handleResetDemo}
      />
    </div>
  );
}
