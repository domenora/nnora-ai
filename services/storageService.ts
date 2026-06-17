/**
 * storageService.ts
 *
 * A unified storage wrapper for the app. On mobile (Capacitor), it uses
 * @capacitor/preferences which is the idiomatic, safe, native-backed
 * key-value store. In a browser it falls back to localStorage so local
 * development still works without a device.
 *
 * Usage:
 *   import { storage } from '../services/storageService';
 *   await storage.set('nnora_learners', JSON.stringify(learners));
 *   const raw = await storage.get('nnora_learners');
 */

// ─── Platform Detection ───────────────────────────────────────────────────────

const isCapacitor = (): boolean =>
    typeof (window as any).Capacitor !== 'undefined' &&
    (window as any).Capacitor.isNativePlatform?.() === true;

// ─── Preferences Plugin (lazy import) ────────────────────────────────────────

type PreferencesPlugin = {
    set(opts: { key: string; value: string }): Promise<void>;
    get(opts: { key: string }): Promise<{ value: string | null }>;
    remove(opts: { key: string }): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<{ keys: string[] }>;
};

let _prefs: PreferencesPlugin | null = null;

async function getPrefs(): Promise<PreferencesPlugin | null> {
    if (!isCapacitor()) return null;
    if (_prefs) return _prefs;
    try {
        const mod = await import('@capacitor/preferences');
        _prefs = mod.Preferences as unknown as PreferencesPlugin;
        return _prefs;
    } catch (e) {
        console.warn('[Storage] @capacitor/preferences not available, falling back to localStorage:', e);
        return null;
    }
}

// ─── Storage Interface ────────────────────────────────────────────────────────

export const storage = {
    async set(key: string, value: string): Promise<void> {
        const prefs = await getPrefs();
        if (prefs) {
            await prefs.set({ key, value });
        } else {
            localStorage.setItem(key, value);
        }
    },

    async get(key: string): Promise<string | null> {
        const prefs = await getPrefs();
        if (prefs) {
            const { value } = await prefs.get({ key });
            return value;
        } else {
            return localStorage.getItem(key);
        }
    },

    async remove(key: string): Promise<void> {
        const prefs = await getPrefs();
        if (prefs) {
            await prefs.remove({ key });
        } else {
            localStorage.removeItem(key);
        }
    },

    async clear(): Promise<void> {
        const prefs = await getPrefs();
        if (prefs) {
            await prefs.clear();
        } else {
            localStorage.clear();
        }
    },

    /** Convenience: get and parse JSON, returning fallback on error */
    async getJSON<T>(key: string, fallback: T): Promise<T> {
        const raw = await this.get(key);
        if (!raw) return fallback;
        try {
            return JSON.parse(raw) as T;
        } catch {
            return fallback;
        }
    },

    /** Convenience: stringify and set JSON */
    async setJSON<T>(key: string, value: T): Promise<void> {
        await this.set(key, JSON.stringify(value));
    },
};
