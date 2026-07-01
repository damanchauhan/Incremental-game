/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private musicInterval: any = null;
  private musicVolumeNode: GainNode | null = null;
  private sfxVolumeNode: GainNode | null = null;
  
  // Current settings
  private isMuted: boolean = false;
  private musicVol: number = 30; // 0 - 100
  private sfxVol: number = 50;   // 0 - 100
  private currentNoteIndex = 0;

  // Simple melody notes (frequency, duration)
  private battleMelody = [
    { note: 130.81, dur: 0.3 }, // C3
    { note: 146.83, dur: 0.3 }, // D3
    { note: 164.81, dur: 0.3 }, // E3
    { note: 146.83, dur: 0.3 }, // D3
    { note: 164.81, dur: 0.3 }, // E3
    { note: 196.00, dur: 0.3 }, // G3
    { note: 174.61, dur: 0.3 }, // F3
    { note: 164.81, dur: 0.6 }, // E3
    { note: 196.00, dur: 0.3 }, // G3
    { note: 220.00, dur: 0.3 }, // A3
    { note: 246.94, dur: 0.3 }, // B3
    { note: 220.00, dur: 0.3 }, // A3
    { note: 261.63, dur: 0.3 }, // C4
    { note: 293.66, dur: 0.3 }, // D4
    { note: 329.63, dur: 0.6 }, // E4
  ];

  private initCtx() {
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
        
        this.musicVolumeNode = this.ctx.createGain();
        this.sfxVolumeNode = this.ctx.createGain();
        
        this.musicVolumeNode.connect(this.ctx.destination);
        this.sfxVolumeNode.connect(this.ctx.destination);
        
        this.updateVolumes();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser", e);
      }
    }
    // Resume context if suspended (browser security policy)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(music: number, sfx: number, enabled: boolean) {
    this.musicVol = music;
    this.sfxVol = sfx;
    this.isMuted = !enabled;
    this.updateVolumes();
  }

  private updateVolumes() {
    if (!this.ctx || !this.musicVolumeNode || !this.sfxVolumeNode) return;
    
    const targetMusic = this.isMuted ? 0 : (this.musicVol / 100) * 0.15; // Cap music volume slightly lower to be pleasant
    const targetSfx = this.isMuted ? 0 : (this.sfxVol / 100) * 0.3; // Cap SFX
    
    this.musicVolumeNode.gain.setValueAtTime(targetMusic, this.ctx.currentTime);
    this.sfxVolumeNode.gain.setValueAtTime(targetSfx, this.ctx.currentTime);
  }

  // Play retro synth soundtrack loop
  public startMusic() {
    this.initCtx();
    if (!this.ctx) return;
    if (this.musicInterval) return;

    this.currentNoteIndex = 0;
    
    const playNextNote = () => {
      if (!this.ctx || this.isMuted || this.musicVol === 0) {
        // Wait and check again
        this.musicInterval = setTimeout(playNextNote, 400);
        return;
      }

      const item = this.battleMelody[this.currentNoteIndex];
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "triangle"; // Nice retro woodwind-like sound
      osc.frequency.setValueAtTime(item.note, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + item.dur);
      
      osc.connect(gain);
      if (this.musicVolumeNode) {
        gain.connect(this.musicVolumeNode);
      }
      
      osc.start();
      osc.stop(this.ctx.currentTime + item.dur);
      
      this.currentNoteIndex = (this.currentNoteIndex + 1) % this.battleMelody.length;
      
      this.musicInterval = setTimeout(playNextNote, item.dur * 1000 + 50);
    };

    playNextNote();
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearTimeout(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // Retro sound effects (SFX)
  public playHit() {
    this.initCtx();
    if (!this.ctx || this.isMuted || this.sfxVol === 0 || !this.sfxVolumeNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    // Pitch sweeps downwards for impact
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxVolumeNode);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playCrit() {
    this.initCtx();
    if (!this.ctx || this.isMuted || this.sfxVol === 0 || !this.sfxVolumeNode) return;

    const now = this.ctx.currentTime;
    // Multi-hit high speed pitches
    const pitches = [300, 450, 600];
    
    pitches.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      osc.frequency.setValueAtTime(freq * 1.5, now + idx * 0.04 + 0.03);

      gain.gain.setValueAtTime(0.6, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.04 + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxVolumeNode);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.06);
    });
  }

  public playDodge() {
    this.initCtx();
    if (!this.ctx || this.isMuted || this.sfxVol === 0 || !this.sfxVolumeNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    // Quick rising pitch for swish
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxVolumeNode);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playLevelUp() {
    this.initCtx();
    if (!this.ctx || this.isMuted || this.sfxVol === 0 || !this.sfxVolumeNode) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.4, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxVolumeNode);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.15);
    });
  }

  public playPrestige() {
    this.initCtx();
    if (!this.ctx || this.isMuted || this.sfxVol === 0 || !this.sfxVolumeNode) return;

    const now = this.ctx.currentTime;
    // Magnificent retro progression
    const chords = [
      [196.00, 246.94, 293.66], // G Major
      [220.00, 277.18, 329.63], // A Major
      [261.63, 329.63, 392.00, 523.25] // C Major / C5
    ];

    chords.forEach((chord, chordIdx) => {
      const chordTime = now + chordIdx * 0.25;
      
      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, chordTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 2, chordTime + 0.22);

        gain.gain.setValueAtTime(0.2, chordTime);
        gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxVolumeNode);

        osc.start(chordTime);
        osc.stop(chordTime + 0.22);
      });
    });
  }

  public playDefeat() {
    this.initCtx();
    if (!this.ctx || this.isMuted || this.sfxVol === 0 || !this.sfxVolumeNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    // Sad falling tone
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxVolumeNode);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
}

export const audio = new AudioManager();
export default audio;
