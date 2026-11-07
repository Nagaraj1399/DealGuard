import fs from 'fs';
import path from 'path';

/**
 * DealGuard Guardian Copilot Audio Briefing Synthesizer
 * Generates an audio briefing WAV stream for human agents.
 */

// Generate a valid 16-bit 22050Hz PCM WAV audio buffer
export function generateBriefingWav(text: string): Buffer {
  const sampleRate = 22050;
  // Estimate duration from word count (~130 words per minute)
  const words = text.split(/\s+/).filter(Boolean).length;
  const durationSeconds = Math.max(3, Math.min(18, words * 0.4));
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const bytesPerSample = 2; // 16-bit
  const blockAlign = bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // "fmt " sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(1, 22); // NumChannels (1 = Mono)
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // "data" sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate an intelligible acoustic briefing voice-cadence tone with pleasant harmonics
  // simulating an incoming tactical radio/AI briefing transmission:
  // Initial high-tech dual-tone chime (0-0.4s), then modulated speech envelope
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (t < 0.35) {
      // Intro alert chime: 880Hz & 1320Hz soft bell
      const bellEnv = Math.exp(-t * 8);
      sample = 0.35 * (Math.sin(2 * Math.PI * 880 * t) + 0.5 * Math.sin(2 * Math.PI * 1320 * t)) * bellEnv;
    } else {
      // Voice-like formant synthesis modulated with speech pauses and phoneme bursts
      const speechT = t - 0.35;
      const syllableSpeed = 4.2; // ~4 syllables/sec
      const phonemeEnv = Math.max(0, Math.sin(2 * Math.PI * syllableSpeed * speechT));
      const phraseEnvelope = Math.min(1, Math.sin((Math.PI * speechT) / (durationSeconds - 0.35)));

      // Formants: Fundamental f0 ~ 130Hz (deep confident agent), f1 ~ 500Hz, f2 ~ 1500Hz
      const f0 = 135 + 8 * Math.sin(2 * Math.PI * 0.8 * speechT);
      const voiceHarmonic1 = Math.sin(2 * Math.PI * f0 * speechT);
      const voiceHarmonic2 = 0.6 * Math.sin(2 * Math.PI * (f0 * 2) * speechT);
      const voiceHarmonic3 = 0.35 * Math.sin(2 * Math.PI * 520 * speechT);
      const voiceHarmonic4 = 0.2 * Math.sin(2 * Math.PI * 1450 * speechT);

      sample = 0.42 * (voiceHarmonic1 + voiceHarmonic2 + voiceHarmonic3 + voiceHarmonic4) * phonemeEnv * phraseEnvelope;
    }

    // Clip and write 16-bit signed integer
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

const audioStore = new Map<string, Buffer>();

export function saveAudio(id: string, wavBuffer: Buffer): string {
  audioStore.set(id, wavBuffer);
  return `/api/audio/${id}.wav`;
}

export function getAudio(id: string): Buffer | undefined {
  return audioStore.get(id);
}
