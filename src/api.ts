import { Listing, User, Message, Escalation } from './types.js';

export async function fetchListings(): Promise<Listing[]> {
  const res = await fetch('/api/listings');
  if (!res.ok) throw new Error('Failed to load listings');
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export async function fetchMessages(channelId: string): Promise<Message[]> {
  const res = await fetch(`/api/channels/${channelId}/messages`);
  if (!res.ok) throw new Error('Failed to load messages');
  return res.json();
}

export async function sendMessage(
  channelId: string,
  payload: {
    senderId: string;
    senderName: string;
    senderRole: 'buyer' | 'seller' | 'agent';
    content: string;
    listingId?: string;
  }
): Promise<{ message: Message; classification: any; escalation: Escalation | null }> {
  const res = await fetch(`/api/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function fetchEscalations(): Promise<Escalation[]> {
  const res = await fetch('/api/agent/escalations');
  if (!res.ok) throw new Error('Failed to load escalations');
  return res.json();
}

export async function takeoverEscalation(
  escalationId: string,
  channelId: string,
  agentId: string,
  agentName: string
): Promise<any> {
  const res = await fetch('/api/agent/takeover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ escalationId, channelId, agentId, agentName }),
  });
  if (!res.ok) throw new Error('Takeover failed');
  return res.json();
}

export async function issueNexconnToken(userId: string): Promise<any> {
  const res = await fetch('/api/nexconn/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to issue token');
  return res.json();
}

export async function resetDatabase(): Promise<any> {
  const res = await fetch('/api/seed/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}
