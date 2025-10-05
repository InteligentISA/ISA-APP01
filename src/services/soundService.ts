// Sound Service for playing notification sounds
import { webAudioSoundGenerator } from './webAudioSoundGenerator';

export interface SoundConfig {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  sounds: {
    like: boolean;
    addToCart: boolean;
    removeFromCart: boolean;
    checkout: boolean;
    success: boolean;
    error: boolean;
    notification: boolean;
    message: boolean;
  };
}

export type SoundType = 
  | 'like' 
  | 'unlike' 
  | 'addToCart' 
  | 'removeFromCart' 
  | 'checkout' 
  | 'success' 
  | 'error' 
  | 'notification' 
  | 'message'
  | 'points'
  | 'orderUpdate'
  | 'payment'
  | 'returnRequest';

export class SoundService {
  private static instance: SoundService;
  private audioContext: AudioContext | null = null;
  private config: SoundConfig = {
    enabled: true,
    volume: 0.7,
    sounds: {
      like: true,
      addToCart: true,
      removeFromCart: true,
      checkout: true,
      success: true,
      error: true,
      notification: true,
      message: true,
    }
  };

  private constructor() {
    this.loadConfig();
    this.initializeAudioContext();
  }

  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  private initializeAudioContext() {
    try {
      // Create audio context for better sound control
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }
  }

  private loadConfig() {
    try {
      const savedConfig = localStorage.getItem('isa-sound-config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.warn('Failed to load sound config:', error);
    }
  }

  private saveConfig() {
    try {
      localStorage.setItem('isa-sound-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save sound config:', error);
    }
  }

  public getConfig(): SoundConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SoundConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
    this.saveConfig();
  }

  public setVolume(volume: number) {
    this.config.volume = Math.max(0, Math.min(1, volume));
    this.saveConfig();
  }

  public toggleSound(soundType: keyof SoundConfig['sounds']) {
    this.config.sounds[soundType] = !this.config.sounds[soundType];
    this.saveConfig();
  }

  private getSoundUrl(soundType: SoundType): string {
    // Map sound types to their file names
    const soundMap: Record<SoundType, string> = {
      like: '/sounds/like.mp3',
      unlike: '/sounds/unlike.mp3',
      addToCart: '/sounds/add-to-cart.mp3',
      removeFromCart: '/sounds/remove-from-cart.mp3',
      checkout: '/sounds/checkout.mp3',
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      notification: '/sounds/notification.mp3',
      message: '/sounds/message.mp3',
      points: '/sounds/points.mp3',
      orderUpdate: '/sounds/order-update.mp3',
      payment: '/sounds/payment.mp3',
      returnRequest: '/sounds/return-request.mp3',
    };

    return soundMap[soundType] || '/sounds/notification.mp3';
  }

  private shouldPlaySound(soundType: SoundType): boolean {
    if (!this.config.enabled) return false;

    // Check specific sound settings
    switch (soundType) {
      case 'like':
      case 'unlike':
        return this.config.sounds.like;
      case 'addToCart':
        return this.config.sounds.addToCart;
      case 'removeFromCart':
        return this.config.sounds.removeFromCart;
      case 'checkout':
        return this.config.sounds.checkout;
      case 'success':
        return this.config.sounds.success;
      case 'error':
        return this.config.sounds.error;
      case 'notification':
        return this.config.sounds.notification;
      case 'message':
        return this.config.sounds.message;
      default:
        return this.config.sounds.notification;
    }
  }

  public async playSound(soundType: SoundType): Promise<void> {
    if (!this.shouldPlaySound(soundType)) {
      return;
    }

    try {
      // Try to play audio file first
      const soundUrl = this.getSoundUrl(soundType);
      const audio = new Audio(soundUrl);
      audio.volume = this.config.volume;
      audio.preload = 'auto';

      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (error) {
      // Fallback to Web Audio API generated sounds
      console.warn(`Failed to play sound file ${soundType}, using generated sound:`, error);
      this.playGeneratedSound(soundType);
    }
  }

  private playGeneratedSound(soundType: SoundType): void {
    try {
      switch (soundType) {
        case 'like':
          webAudioSoundGenerator.playLikeSound();
          break;
        case 'unlike':
          webAudioSoundGenerator.playUnlikeSound();
          break;
        case 'addToCart':
          webAudioSoundGenerator.playAddToCartSound();
          break;
        case 'removeFromCart':
          webAudioSoundGenerator.playRemoveFromCartSound();
          break;
        case 'checkout':
          webAudioSoundGenerator.playCheckoutSound();
          break;
        case 'success':
          webAudioSoundGenerator.playSuccessSound();
          break;
        case 'error':
          webAudioSoundGenerator.playErrorSound();
          break;
        case 'notification':
          webAudioSoundGenerator.playNotificationSound();
          break;
        case 'message':
          webAudioSoundGenerator.playMessageSound();
          break;
        case 'points':
          webAudioSoundGenerator.playPointsSound();
          break;
        case 'orderUpdate':
          webAudioSoundGenerator.playOrderUpdateSound();
          break;
        case 'payment':
          webAudioSoundGenerator.playPaymentSound();
          break;
        case 'returnRequest':
          webAudioSoundGenerator.playReturnRequestSound();
          break;
        default:
          webAudioSoundGenerator.playNotificationSound();
      }
    } catch (error) {
      console.warn(`Failed to play generated sound ${soundType}:`, error);
    }
  }

  public async playSoundWithFallback(soundType: SoundType, fallbackSound?: SoundType): Promise<void> {
    try {
      await this.playSound(soundType);
    } catch (error) {
      if (fallbackSound) {
        await this.playSound(fallbackSound);
      }
    }
  }

  // Convenience methods for common actions
  public async playLikeSound() {
    await this.playSound('like');
  }

  public async playUnlikeSound() {
    await this.playSound('unlike');
  }

  public async playAddToCartSound() {
    await this.playSound('addToCart');
  }

  public async playRemoveFromCartSound() {
    await this.playSound('removeFromCart');
  }

  public async playCheckoutSound() {
    await this.playSound('checkout');
  }

  public async playSuccessSound() {
    await this.playSound('success');
  }

  public async playErrorSound() {
    await this.playSound('error');
  }

  public async playNotificationSound() {
    await this.playSound('notification');
  }

  public async playMessageSound() {
    await this.playSound('message');
  }

  public async playPointsSound() {
    await this.playSound('points');
  }

  public async playOrderUpdateSound() {
    await this.playSound('orderUpdate');
  }

  public async playPaymentSound() {
    await this.playSound('payment');
  }

  public async playReturnRequestSound() {
    await this.playSound('returnRequest');
  }

  // Method to preload sounds for better performance
  public async preloadSounds(soundTypes: SoundType[] = []): Promise<void> {
    const soundsToPreload = soundTypes.length > 0 ? soundTypes : [
      'like', 'unlike', 'addToCart', 'removeFromCart', 'checkout', 
      'success', 'error', 'notification', 'message', 'points',
      'orderUpdate', 'payment', 'returnRequest'
    ];

    const preloadPromises = soundsToPreload.map(async (soundType) => {
      try {
        const soundUrl = this.getSoundUrl(soundType);
        const audio = new Audio(soundUrl);
        audio.preload = 'auto';
        // Trigger loading
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve, { once: true });
      audio.addEventListener('error', reject, { once: true });
      audio.load();
    });
      } catch (error) {
        console.warn(`Failed to preload sound ${soundType}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  // Method to test if sounds are working
  public async testSound(soundType: SoundType = 'notification'): Promise<boolean> {
    try {
      await this.playSound(soundType);
      return true;
    } catch (error) {
      console.warn(`Sound test failed for ${soundType}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const soundService = SoundService.getInstance();
