// Web Audio API Sound Generator for creating notification sounds
export class WebAudioSoundGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }
  }

  private createTone(frequency: number, duration: number, volume: number = 0.3): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private createChord(frequencies: number[], duration: number, volume: number = 0.2): void {
    if (!this.audioContext) return;

    frequencies.forEach(freq => {
      this.createTone(freq, duration, volume / frequencies.length);
    });
  }

  // Generate different types of notification sounds
  public playLikeSound(): void {
    // Pleasant ascending tone
    this.createTone(523.25, 0.2, 0.3); // C5
    setTimeout(() => this.createTone(659.25, 0.2, 0.3), 100); // E5
  }

  public playUnlikeSound(): void {
    // Descending tone
    this.createTone(659.25, 0.2, 0.3); // E5
    setTimeout(() => this.createTone(523.25, 0.2, 0.3), 100); // C5
  }

  public playAddToCartSound(): void {
    // Quick ascending chord
    this.createChord([523.25, 659.25, 783.99], 0.3, 0.25); // C-E-G
  }

  public playRemoveFromCartSound(): void {
    // Descending chord
    this.createChord([783.99, 659.25, 523.25], 0.3, 0.25); // G-E-C
  }

  public playCheckoutSound(): void {
    // Success chord progression
    this.createChord([523.25, 659.25, 783.99], 0.2, 0.2); // C-E-G
    setTimeout(() => this.createChord([659.25, 783.99, 1046.50], 0.3, 0.2), 200); // E-G-C6
  }

  public playSuccessSound(): void {
    // Major chord with flourish
    this.createChord([523.25, 659.25, 783.99], 0.4, 0.3); // C-E-G
    setTimeout(() => this.createTone(1046.50, 0.2, 0.2), 300); // C6
  }

  public playErrorSound(): void {
    // Dissonant descending tone
    this.createTone(440, 0.1, 0.4); // A4
    setTimeout(() => this.createTone(415.30, 0.1, 0.4), 100); // G#4
    setTimeout(() => this.createTone(392.00, 0.2, 0.4), 200); // G4
  }

  public playNotificationSound(): void {
    // Standard notification beep
    this.createTone(800, 0.1, 0.3);
    setTimeout(() => this.createTone(800, 0.1, 0.3), 150);
  }

  public playMessageSound(): void {
    // Soft chime
    this.createTone(659.25, 0.2, 0.25); // E5
    setTimeout(() => this.createTone(783.99, 0.2, 0.25), 100); // G5
  }

  public playPointsSound(): void {
    // Celebratory ascending scale
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99]; // C-D-E-F-G
    notes.forEach((freq, index) => {
      setTimeout(() => this.createTone(freq, 0.15, 0.2), index * 80);
    });
  }

  public playOrderUpdateSound(): void {
    // Professional notification
    this.createTone(440, 0.2, 0.3); // A4
    setTimeout(() => this.createTone(523.25, 0.2, 0.3), 200); // C5
  }

  public playPaymentSound(): void {
    // Cash register-like sound
    this.createTone(523.25, 0.1, 0.3); // C5
    setTimeout(() => this.createTone(659.25, 0.1, 0.3), 50); // E5
    setTimeout(() => this.createTone(783.99, 0.1, 0.3), 100); // G5
    setTimeout(() => this.createTone(1046.50, 0.2, 0.3), 150); // C6
  }

  public playReturnRequestSound(): void {
    // Gentle notification
    this.createTone(440, 0.3, 0.25); // A4
    setTimeout(() => this.createTone(523.25, 0.3, 0.25), 200); // C5
  }

  // Method to test if audio is working
  public async testAudio(): Promise<boolean> {
    try {
      if (!this.audioContext) {
        this.initializeAudioContext();
      }
      
      if (!this.audioContext) {
        return false;
      }

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Play a simple test tone
      this.createTone(440, 0.1, 0.1);
      return true;
    } catch (error) {
      console.warn('Audio test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const webAudioSoundGenerator = new WebAudioSoundGenerator();

