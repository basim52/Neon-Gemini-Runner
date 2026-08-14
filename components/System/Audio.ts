/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export class AudioController {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  musicGain: GainNode | null = null;
  isBgmPlaying = false;
  bgmInterval: any = null;
  step = 0;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4; // Master volume
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.25; // Music volume
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted: boolean) {
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.4;
    }
  }

  startBGM() {
    if (this.isBgmPlaying) return;
    this.init();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    this.step = 0;

    // Driving Cyberpunk Synthwave scale (A minor / F / G / E)
    const bassFreqs = [55, 55, 110, 55,  87.31, 87.31, 174.61, 87.31,  98.0, 98.0, 196.0, 98.0,  82.41, 82.41, 164.81, 123.47];
    const arpFreqs  = [220, 329.63, 440, 523.25, 659.25, 523.25, 440, 329.63, 261.63, 392, 523.25, 659.25, 783.99, 659.25, 523.25, 392];
    const leadFreqs = [440, 0, 523.25, 659.25, 0, 783.99, 659.25, 0, 523.25, 0, 659.25, 880, 0, 783.99, 659.25, 523.25];

    this.bgmInterval = setInterval(() => {
      if (!this.ctx || !this.isBgmPlaying || !this.musicGain) return;
      const t = this.ctx.currentTime;
      const s = this.step % 16;

      // 1. Driving Four-On-The-Floor Heavy Cyber Kick (steps 0, 4, 8, 12)
      if (s % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(160, t);
        kickOsc.frequency.exponentialRampToValueAtTime(32, t + 0.12);

        kickGain.gain.setValueAtTime(0.85, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGain);

        kickOsc.start(t);
        kickOsc.stop(t + 0.15);
      }

      // 2. Snare / Cyber Clap on steps 4 and 12
      if (s === 4 || s === 12) {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1);
        }
        const snareNoise = this.ctx.createBufferSource();
        snareNoise.buffer = buffer;

        const snareFilter = this.ctx.createBiquadFilter();
        snareFilter.type = 'highpass';
        snareFilter.frequency.setValueAtTime(1000, t);

        const snareGain = this.ctx.createGain();
        snareGain.gain.setValueAtTime(0.45, t);
        snareGain.gain.exponentialRampToValueAtTime(0.01, t + 0.11);

        snareNoise.connect(snareFilter);
        snareFilter.connect(snareGain);
        snareGain.connect(this.musicGain);

        snareNoise.start(t);
        snareNoise.stop(t + 0.12);
      }

      // 3. Crisp Hi-Hat on offbeats (2, 6, 10, 14) & 16th groove
      if (s % 2 === 0) {
        const hatSize = Math.floor(this.ctx.sampleRate * 0.04);
        const hatBuffer = this.ctx.createBuffer(1, hatSize, this.ctx.sampleRate);
        const hatData = hatBuffer.getChannelData(0);
        for (let i = 0; i < hatSize; i++) {
          hatData[i] = (Math.random() * 2 - 1);
        }
        const hatSource = this.ctx.createBufferSource();
        hatSource.buffer = hatBuffer;

        const hatFilter = this.ctx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.setValueAtTime(6000, t);

        const hatGain = this.ctx.createGain();
        const isOpen = s === 14;
        hatGain.gain.setValueAtTime(isOpen ? 0.35 : 0.2, t);
        hatGain.gain.exponentialRampToValueAtTime(0.001, t + (isOpen ? 0.09 : 0.04));

        hatSource.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(this.musicGain);

        hatSource.start(t);
        hatSource.stop(t + 0.1);
      }

      // 4. Heavy Sawtooth Synth Bassline
      const bassOsc = this.ctx.createOscillator();
      const bassFilter = this.ctx.createBiquadFilter();
      const bassGain = this.ctx.createGain();

      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassFreqs[s], t);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(450 + (s % 4 === 0 ? 300 : 0), t);
      bassFilter.Q.value = 5;

      bassGain.gain.setValueAtTime(0.4, t);
      bassGain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.musicGain);

      bassOsc.start(t);
      bassOsc.stop(t + 0.1);

      // 5. Energetic Arpeggio Synth Layer
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();

      arpOsc.type = 'sawtooth';
      arpOsc.frequency.setValueAtTime(arpFreqs[s], t);

      arpGain.gain.setValueAtTime(0.2, t);
      arpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      arpOsc.connect(arpGain);
      arpGain.connect(this.musicGain);

      arpOsc.start(t);
      arpOsc.stop(t + 0.09);

      // 6. Cyber Lead Melody Accent Layer
      if (leadFreqs[s] > 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();

        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadFreqs[s], t);

        leadGain.gain.setValueAtTime(0.22, t);
        leadGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        leadOsc.connect(leadGain);
        leadGain.connect(this.musicGain);

        leadOsc.start(t);
        leadOsc.stop(t + 0.16);
      }

      this.step++;
    }, 102); // ~147 BPM intense driving speed
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  playGemCollect() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(2400, t + 0.12);

    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playPowerup() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.4, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.2);
    });
  }

  playLetterCollect() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99]; 
    
    freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = f;
        
        const start = t + (i * 0.04);
        const dur = 0.3;

        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + dur);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        osc.start(start);
        osc.stop(start + dur);
    });
  }

  playJump(isDouble = false) {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = isDouble ? 400 : 200;
    const endFreq = isDouble ? 800 : 450;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.15);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playLaserShot() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.15);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playExplosion() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    noise.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + 0.25);
  }

  playBoost() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.3);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  playDamage() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.3);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.6, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.3);
    noise.start(t);
    noise.stop(t + 0.3);
  }

  playVictoryFanfare() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);
      gain.gain.setValueAtTime(0.35, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + 0.36);
    });
  }
}

export const audio = new AudioController();
