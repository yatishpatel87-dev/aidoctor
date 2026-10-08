import { db, getTodayDateString } from './storageService';
import { PlantCareReminder, NotificationSettings } from '../types/plant';

type RemindersListener = (reminders: PlantCareReminder[]) => void;

class NotificationService {
  private listeners: Set<RemindersListener> = new Set();
  private intervalId: any = null;
  private notifiedRemindersToday: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initLifecycle();
    }
  }

  private initLifecycle() {
    // Initial check
    setTimeout(() => {
      this.checkDueReminders();
    }, 2000);

    // Periodic check every 60 seconds
    this.intervalId = setInterval(() => {
      this.checkDueReminders();
    }, 60000);

    // Check on visibility change (when user refocuses the app)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkDueReminders();
      }
    });
  }

  public subscribe(listener: RemindersListener): () => void {
    this.listeners.add(listener);
    this.refreshReminders().then((rems) => listener(rems));
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async refreshReminders(): Promise<PlantCareReminder[]> {
    const list = await db.getReminders();
    this.notifyListeners(list);
    return list;
  }

  private notifyListeners(reminders: PlantCareReminder[]) {
    this.listeners.forEach((cb) => cb(reminders));
  }

  public isSupported(): boolean {
    try {
      return typeof window !== 'undefined' && 'Notification' in window;
    } catch {
      return false;
    }
  }

  public getPermission(): NotificationPermission {
    try {
      if (!this.isSupported()) return 'denied';
      return Notification.permission;
    } catch {
      return 'denied';
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await db.updateNotificationSettings({ browserNotificationsEnabled: true });
        // Trigger a pleasant welcome notification
        this.playGardenChime();
        this.showNativeNotification('🌿 Plant AI Doctor', {
          body: 'નોટિફિકેશન સક્રિય થઈ ગઈ છે! છોડને પાણી અને ખાતર આપવાના સમયસર રીમાઇન્ડર્સ મળશે.',
          icon: '/favicon.ico',
        });
      }
      return permission;
    } catch (err) {
      console.warn('Notification permission request error:', err);
      return 'denied';
    }
  }

  public playGardenChime() {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Pleasant 2-tone melodic chime: Note 1 (D5 = 587.33Hz), Note 2 (A5 = 880Hz)
      const now = ctx.currentTime;

      // First chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Second chime (higher harmonic)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.2, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.75);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  private showNativeNotification(title: string, options: NotificationOptions) {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return;
    }

    try {
      new Notification(title, {
        ...options,
        badge: '/favicon.ico',
      });
    } catch (e) {
      // Fallback for some mobile browsers
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, options);
        });
      }
    }
  }

  /**
   * Check for due watering and care reminders from the database
   */
  public async checkDueReminders() {
    const reminders = await db.getReminders();
    this.notifyListeners(reminders);

    const settings = await db.getNotificationSettings();
    if (!settings.browserNotificationsEnabled || this.getPermission() !== 'granted') {
      return;
    }

    const today = getTodayDateString();

    // Find pending reminders due on or before today that haven't been completed
    const dueReminders = reminders.filter(
      (r) => !r.isCompletedToday && r.dueDate <= today
    );

    if (dueReminders.length === 0) return;

    // Filter reminders not yet notified in this session today
    const unnotified = dueReminders.filter(
      (r) => !this.notifiedRemindersToday.has(r.id)
    );

    if (unnotified.length > 0) {
      // Pick top priority reminder or summary
      const top = unnotified[0];
      const count = unnotified.length;

      let title = `🌿 ${top.plantName} - સંભાળ સમય!`;
      let body = top.title;

      if (count > 1) {
        title = `🌿 Plant AI Doctor: આજે ${count} છોડની સંભાળ બાકી છે`;
        body = `${top.plantName} (${top.title}) અને બીજા ${count - 1} છોડને પાણી/સંભાળ આપો.`;
      } else {
        body = `${top.title}: ${top.description}`;
      }

      if (settings.soundEnabled) {
        this.playGardenChime();
      }

      this.showNativeNotification(title, {
        body,
        icon: top.plantImage || '/favicon.ico',
        tag: `care-reminder-${top.id}`,
      });

      unnotified.forEach((r) => this.notifiedRemindersToday.add(r.id));
    }
  }

  /**
   * Send instant test notification
   */
  public async sendTestNotification(): Promise<boolean> {
    const perm = this.getPermission();
    if (perm !== 'granted') {
      const requested = await this.requestPermission();
      if (requested !== 'granted') {
        return false;
      }
    }

    this.playGardenChime();
    this.showNativeNotification('🌿 Plant AI Doctor (ટેસ્ટ)', {
      body: '💧 તુલસી અને ટામેટાને પાણી આપવાનો સમય થઈ ગયો છે! (સફળતાપૂર્વક ચાલુ)',
      icon: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=128&q=80',
    });
    return true;
  }
}

export const notificationService = new NotificationService();
