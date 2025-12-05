import { InstrumentType, NoteName } from '../types';
import { PIANO_NOTES } from '../constants';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private feedbackGain: GainNode | null = null;
  private instrument: InstrumentType = InstrumentType.PIANO;
  private volume: number = 0.5;

  public initialize() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;

      // Magical Echo Effect
      this.delayNode = this.ctx.createDelay();
      this.delayNode.delayTime.value = 0.35; // 350ms echo
      
      this.feedbackGain = this.ctx.createGain();
      this.feedbackGain.gain.value = 0.3; // Gentle feedback

      // Routing: Master -> Destination (Dry) AND Master -> Delay -> Feedback -> Delay -> Destination (Wet)
      this.masterGain.connect(this.ctx.destination);
      
      this.masterGain.connect(this.delayNode);
      this.delayNode.connect(this.feedbackGain);
      this.feedbackGain.connect(this.delayNode);
      this.delayNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = vol;
    if (this.masterGain) {
      this.masterGain.gain.value = vol;
    }
  }

  public setInstrument(inst: InstrumentType) {
    this.instrument = inst;
  }

  public playDing() {
    this.initialize();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    // High pitched magical "ding"
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.1);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  public playNote(noteName: NoteName) {
    this.initialize();
    if (!this.ctx || !this.masterGain) return;

    const noteDef = PIANO_NOTES.find(n => n.name === noteName);
    if (!noteDef) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.frequency.value = noteDef.freq;

    // Instrument Shaping
    if (this.instrument === InstrumentType.PIANO) {
      // Magic Piano: Softer attack, sparkly release
      osc.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(1.0, t + 0.05); // Soft attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, t + 2.0); // Long decay for magic
      osc.stop(t + 2.0);

      // Harmonics for sparkle
      const harm = this.ctx.createOscillator();
      const harmGain = this.ctx.createGain();
      harm.type = 'sine';
      harm.frequency.value = noteDef.freq * 2; // Octave up
      harm.connect(harmGain);
      harmGain.connect(this.masterGain);
      harmGain.gain.setValueAtTime(0, t);
      harmGain.gain.linearRampToValueAtTime(0.4, t + 0.05);
      harmGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      harm.start(t);
      harm.stop(t + 1.5);

    } else if (this.instrument === InstrumentType.XYLOPHONE) {
      osc.type = 'sine';
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(1, t + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      osc.stop(t + 0.5);
    } else {
      // Synth (Magic Flute ish)
      osc.type = 'square';
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      osc.disconnect();
      osc.connect(filter);
      filter.connect(gainNode);

      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(0.6, t + 0.2);
      gainNode.gain.linearRampToValueAtTime(0, t + 0.8);
      osc.stop(t + 0.8);
    }

    osc.start(t);
  }
}

export const soundEngine = new SoundEngine();