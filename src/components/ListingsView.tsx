import React, { useState } from 'react';
import { MessageSquare, ShieldCheck, CheckCircle2, MapPin, Building, ArrowRight } from 'lucide-react';
import { Listing, User } from '../types.js';

interface ListingsViewProps {
  listings: Listing[];
  activeUser: User | null;
  onOpenChat: (listing: Listing) => void;
  onOpenDemoGuide: () => void;
}

export const ListingsView: React.FC<ListingsViewProps> = ({
  listings,
  activeUser,
  onOpenChat,
  onOpenDemoGuide,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'condo' | 'penthouse' | 'villa' | 'loft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = listings.filter((item) => {
    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'condo' && item.propertyType.toLowerCase().includes('condo')) ||
      (selectedFilter === 'penthouse' && item.propertyType.toLowerCase().includes('penthouse')) ||
      (selectedFilter === 'villa' && item.propertyType.toLowerCase().includes('villa')) ||
      (selectedFilter === 'loft' && item.propertyType.toLowerCase().includes('loft'));

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Editorial Hero Header */}
      <div className="mb-10 border-b border-neutral-800 pb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-medium text-rose-400 mb-2.5">
              <span>Nexconn Build Challenge 2026</span>
              <span aria-hidden="true">·</span>
              <span>Autonomous Guardian Copilot</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl" style={{ textWrap: 'balance' }}>
              Every deal dies one of two ways — a scam, or a missed moment.
            </h1>
            <p className="mt-3 text-base text-neutral-400 sm:text-lg">
              DealGuard protects high-stakes real-estate transactions with live bubble scam detection and proactive spoken agent briefings for hot leads.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenDemoGuide}
              className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors whitespace-nowrap"
            >
              <span>View Scripted Demo Beats</span>
              <ArrowRight className="h-4 w-4 text-rose-400" />
            </button>
          </div>
        </div>

        {/* Filter bar and search */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg overflow-x-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All Properties ({listings.length})
            </button>
            <button
              onClick={() => setSelectedFilter('condo')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedFilter === 'condo'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Condominiums
            </button>
            <button
              onClick={() => setSelectedFilter('penthouse')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedFilter === 'penthouse'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Penthouses
            </button>
            <button
              onClick={() => setSelectedFilter('villa')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedFilter === 'villa'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Villas
            </button>
            <button
              onClick={() => setSelectedFilter('loft')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedFilter === 'loft'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Lofts
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by neighborhood or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-neutral-700 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Property Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 transition-all hover:border-neutral-700 hover:shadow-lg"
          >
            {/* Image Container with Fallback */}
            <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-950">
              <img
                src={listing.image}
                alt={listing.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                onError={(e) => {
                  // Fallback styling if image fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-container')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-container flex h-full w-full flex-col items-center justify-center bg-neutral-900 text-neutral-500 p-6 text-center';
                    fallback.innerHTML = `<span class="text-sm font-medium text-neutral-300 mb-1">${listing.title}</span><span class="text-xs text-neutral-500">${listing.locality}</span>`;
                    parent.appendChild(fallback);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verified Listing</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-baseline justify-between text-white">
                <div>
                  <div className="text-2xl font-bold tracking-tight tabular-nums font-mono">
                    {listing.formattedPrice}
                  </div>
                  <div className="text-xs text-neutral-300">
                    {listing.locality}
                  </div>
                </div>
                <div className="text-xs text-neutral-400">
                  Seller: {listing.sellerName}
                </div>
              </div>
            </div>

            {/* Content & Specs */}
            <div className="flex flex-1 flex-col p-6">
              <h2 className="text-xl font-bold tracking-tight text-white mb-2">
                {listing.title}
              </h2>

              {/* Zero-pill unboxed metadata */}
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3.5">
                <span>{listing.bedrooms} Beds</span>
                <span aria-hidden="true">·</span>
                <span>{listing.bathrooms} Baths</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono">{listing.sqft.toLocaleString()} sqft</span>
                <span aria-hidden="true">·</span>
                <span>{listing.propertyType}</span>
              </div>

              <p className="text-xs leading-relaxed text-neutral-300 line-clamp-2 mb-4">
                {listing.description}
              </p>

              {/* Highlights */}
              <div className="mb-6 flex flex-wrap gap-2 text-xs text-neutral-400">
                {listing.highlights.map((h, i) => (
                  <span key={i} className="flex items-center gap-1 text-[11px] text-neutral-300">
                    <CheckCircle2 className="h-3 w-3 text-rose-400 shrink-0" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>

              {/* Actions Footer */}
              <div className="mt-auto flex items-center justify-between border-t border-neutral-800/80 pt-4">
                <div className="text-xs text-neutral-400">
                  <span>Chat Channel: </span>
                  <span className="text-neutral-200 font-medium">Direct P2P Encrypted</span>
                </div>
                <button
                  onClick={() => onOpenChat(listing)}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 whitespace-nowrap"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-neutral-900" />
                  <span>Chat with Seller</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
