export interface User {
  id: string;
  name: string;
  role: 'buyer' | 'seller' | 'agent';
  avatar: string;
  title: string;
  agency?: string;
  rating?: number;
  phone?: string;
  statusText?: string;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  formattedPrice: string;
  locality: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  description: string;
  highlights: string[];
  image: string;
  sellerId: string;
  sellerName: string;
  status: 'available' | 'under_offer';
  verified: boolean;
}

export interface MessageClassification {
  trust_flag: boolean;
  trust_reason: string | null;
  lead_score: number;
  risk_of_loss: number;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'seller' | 'agent' | 'system';
  content: string;
  timestamp: number;
  classification?: MessageClassification;
  trustFlag?: boolean;
  trustReason?: string | null;
  leadScore?: number;
  riskOfLoss?: number;
  isEscalated?: boolean;
  escalationId?: string;
  isSystemNotice?: boolean;
  audioBriefingUrl?: string;
  audioTranscript?: string;
}

export interface Escalation {
  id: string;
  channelId: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  triggerReason: 'lead_score' | 'risk_of_loss' | 'both';
  leadScore: number;
  riskOfLoss: number;
  briefingTranscript: string;
  audioUrl: string;
  timestamp: number;
  status: 'active' | 'claimed' | 'resolved';
  claimedBy?: string;
  lastMessageText: string;
}
