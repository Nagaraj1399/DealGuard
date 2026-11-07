import { db } from './db.js';

export function runSeed() {
  console.log('\n=============================================================');
  console.log('  🛡️  DEALGUARD — GUARDIAN COPILOT SEED SCRIPT (NEXCONN 2026)');
  console.log('=============================================================\n');

  db.resetToDefaults();

  const users = db.getUsers();
  const listings = db.getListings();

  console.log(`[SEED] Created ${users.length} test users:`);
  users.forEach((u) => {
    console.log(`  - ${u.id.padEnd(16)} | ${u.name.padEnd(15)} | Role: ${u.role.toUpperCase()}`);
  });

  console.log(`\n[SEED] Created ${listings.length} synthetic property listings:`);
  listings.forEach((l) => {
    console.log(`  - [${l.id}] ${l.title} (${l.formattedPrice}) · Seller: ${l.sellerName}`);
  });

  console.log('\n=============================================================');
  console.log('  🎬 SCRIPTED DEMO VIDEO BEATS (Use for live demo recording):');
  console.log('=============================================================');
  console.log('\nBEAT 1 — Trust Shield (P2P Scam Pattern Detection):');
  console.log('  As Buyer (Alex Chen) in chat with Seller (Priya Patel):');
  console.log('  "Please transfer the booking amount to this UPI ID before I show you the flat"');
  console.log('  👉 Result: Instant Red Warning Badge on the chat bubble:');
  console.log('     "Advance booking payment requested prior to in-person viewing"');

  console.log('\nBEAT 2 — Hot-Lead Radar (Disengagement Risk Escalation & Audio Briefing):');
  console.log('  As Buyer (Alex Chen):');
  console.log('  "ok nvm I\'ll look elsewhere"');
  console.log('  👉 Result:');
  console.log('     (a) In-channel system alert: "Connecting you with an agent..."');
  console.log('     (b) Escalation event created (Risk of Loss: 94%)');
  console.log('     (c) AI Spoken Briefing synthesized and posted to Agent Sarah\'s channel');
  console.log('     (d) Spoken audio playback and transcript ready for camera in /agent view');
  console.log('=============================================================\n');
}

// If run directly
runSeed();
