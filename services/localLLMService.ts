/**
 * localLLMService.ts
 *
 * (nnoraAgentChat, generateProactiveNudge, generateNnoraArtifact)
 * but routes inference to the on-device LLM via @capgo/capacitor-llm.
 *
 * FIRST-LAUNCH WORKFLOW:
 *  1. App starts → calls initializeLocalLLM()
 *  2. Service checks if model file already exists on device storage
 *  3. If NOT found → downloads from MODEL_DOWNLOAD_URL, emitting progress events
 *  4. Once downloaded → calls setModel() + warmup() to load it into memory
 *  5. LLM is ready for inference
 *
 */

import {
    LearnerProfile, ChatMessage, AgentAction, UserRole,
    NnoraMode, NnoraArtifact
} from '../types';

// ─── Configuration ─────────────────────────────────────────────────────────────

/**
 * The local filename the model will be saved as on the device.
 * 
 */
const MODEL_FILE_NAME = 'llama_3_2_1b_xnnpack_spinquant.pte'; // ← Change to your model file name

/**
 * Hosted model URL. The model is downloaded from here on first launch
 * and cached locally — subsequent launches use the cached file.
 * 
 */
const MODEL_DOWNLOAD_URL = 'https://huggingface.co/software-mansion/react-native-executorch-llama-3.2/resolve/main/1b/xnnpack/llama_3_2_1b_xnnpack_spinquant.pte';

/**
 * Engine to use. 'executorch' for .pte files, 'mediapipe' for .task files.
 */
const MODEL_ENGINE: 'executorch' | 'mediapipe' = 'executorch';
/** Session ID for the LLM plugin — keeps system prompt warm between messages */
const SESSION_ID = 'nnora-v1';

/** Storage key to remember if the model has been downloaded */
const MODEL_DOWNLOADED_KEY = 'knora_model_downloaded';

// ─── Platform Detection ───────────────────────────────────────────────────────

const isCapacitor = (): boolean =>
    typeof (window as any).Capacitor !== 'undefined' &&
    (window as any).Capacitor.isNativePlatform?.() === true;

// ─── Progress Event Emitter ───────────────────────────────────────────────────

export type LLMProgressEvent = {
    phase: 'checking' | 'downloading' | 'loading' | 'ready' | 'error';
    /** 0–100 during downloading, undefined for other phases */
    percent?: number;
    /** Human-readable status string */
    message: string;
};

type ProgressListener = (event: LLMProgressEvent) => void;
const progressListeners = new Set<ProgressListener>();

/** Subscribe to LLM initialization progress events */
export const onLLMProgress = (listener: ProgressListener): (() => void) => {
    progressListeners.add(listener);
    // Return an unsubscribe function
    return () => progressListeners.delete(listener);
};

const emitProgress = (event: LLMProgressEvent) => {
    progressListeners.forEach(fn => fn(event));
};

// ─── LLM Plugin Import (lazy) ─────────────────────────────────────────────────

type CapgoLLM = {
    setModel(opts: { engine: string; modelPath: string }): Promise<void>;
    warmup(opts: { sessionId: string; promptPrefix: string }): Promise<void>;
    prompt(opts: { sessionId: string; prompt: string }): Promise<{ response: string }>;
    systemAvailability(): Promise<{ status: 'available' | 'downloadable' | 'unavailable' }>;
};

let _llmPlugin: CapgoLLM | null = null;
let _initialized = false;
let _initError: string | null = null;
let _downloadedThisSession = false;

async function getLLMPlugin(): Promise<CapgoLLM | null> {
    if (!isCapacitor()) return null;
    if (_llmPlugin) return _llmPlugin;
    try {
        const mod = await import('@capgo/capacitor-llm');
        _llmPlugin = (mod as any).CapacitorLlm as CapgoLLM;
        return _llmPlugin;
    } catch (e) {
        console.error('[LocalLLM] Failed to import @capgo/capacitor-llm:', e);
        return null;
    }
}

// ─── Filesystem Plugin (for checking if model already exists) ─────────────────

async function modelExistsLocally(): Promise<boolean> {
    // We use a localStorage flag as a lightweight check.
    // The real file check happens implicitly when setModel() is called —
    // if the file doesn't exist, the plugin will throw and we catch it.
    return localStorage.getItem(MODEL_DOWNLOADED_KEY) === 'true';
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const NNORA_SYSTEM_PROMPT = `
You are Nnora, an Empowering Parenting Guide for Inclusive Foundational Learning.

CORE IDENTITY:
You are a deliberate, relatable partner that understands the realities of parenting in an African context. You do not use high-sounding terms or abstract theories. You talk like a knowledgeable, supportive friend who gets it.

CORE FUNCTION:
Help parents engage their child's development through simple, everyday actions. Do NOT dump information — listen, relate, and provide very practical, locally-grounded advice using things usually found around a typical home.

PERSONALITY:
- RELATABLE & WARM: Deeply empathetic, highly relatable. Speak naturally, warmly, and directly.
- PRACTICAL & GROUNDED: Avoid big abstract concepts. Suggest using groundnuts, matching socks, singing songs, playing outside.
- FLEXIBLE: If a parent has an urgent need, drop any script and help immediately.

CONVERSATIONAL RULES:
- Speak like a real person over WhatsApp. Short, crisp, natural sentences.
- Always end with exactly ONE targeted, meaningful question.
- NO BULLET LISTS in conversational turns (unless generating an artifact).
- NO GENERIC ADVICE. Give a specific example using household items.
- NO CLINICAL LABELS. Avoid abstract diagnoses unless the parent brings them up.
- NEVER provide a full solution in the first message. First, understand the child.

ACTION PROTOCOL:
- Do NOT suggest an action in every message.
- When you want to create/update a learner profile or save an artifact, include it in your JSON output.

OUTPUT FORMAT (respond ONLY with valid JSON, no markdown, no commentary):
{
  "text": "Your short, warm, conversational response. Max 3-4 sentences. One question at end.",
  "action": {
    "type": "CREATE_LEARNER_PROFILE" | "UPDATE_LEARNER_PROFILE" | "SAVE_ARTIFACT" | "GENERATE_ACTION_PLAN" | "NONE",
    "summary": "Brief summary of what this action will do",
    "data": {}
  }
}

OMIT the "action" field entirely if you are not proposing a specific action.
`;

// ─── Download Model ───────────────────────────────────────────────────────────

/**
 * Downloads the model from MODEL_DOWNLOAD_URL to the device's local storage.
 * Reports progress via the onLLMProgress event emitter.
 * Uses a manual XHR so we can get real download progress percentages.
 */
const downloadModelWithProgress = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', MODEL_DOWNLOAD_URL, true);
        xhr.responseType = 'blob';

        xhr.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                const loadedMB = (event.loaded / 1024 / 1024).toFixed(0);
                const totalMB = (event.total / 1024 / 1024).toFixed(0);
                emitProgress({
                    phase: 'downloading',
                    percent,
                    message: `Downloading AI model… ${loadedMB} MB / ${totalMB} MB`,
                });
            } else {
                // Server didn't send Content-Length — show indeterminate progress
                const loadedMB = (event.loaded / 1024 / 1024).toFixed(0);
                emitProgress({
                    phase: 'downloading',
                    message: `Downloading AI model… ${loadedMB} MB received`,
                });
            }
        };

        xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                emitProgress({ phase: 'downloading', percent: 100, message: 'Download complete. Installing model…' });

                // Save the blob to the app's local filesystem via a URL the plugin can read.
                // @capgo/capacitor-llm accepts a local file path. We store the blob
                // using the Capacitor Filesystem plugin and then tell setModel() about it.
                try {
                    // Attempt to use the Filesystem API if available
                    const { Filesystem, Directory } = await import('@capacitor/filesystem');
                    const reader = new FileReader();
                    reader.onload = async () => {
                        const base64Data = (reader.result as string).split(',')[1];
                        await Filesystem.writeFile({
                            path: `models/${MODEL_FILE_NAME}`,
                            data: base64Data,
                            directory: Directory.Library,
                            recursive: true,
                        });
                        localStorage.setItem(MODEL_DOWNLOADED_KEY, 'true');
                        resolve();
                    };
                    reader.onerror = () => reject(new Error('Failed to read downloaded model blob'));
                    reader.readAsDataURL(xhr.response);
                } catch (fsErr) {
                    // @capacitor/filesystem not installed — fall back to plugin's own download
                    // Some versions of @capgo/capacitor-llm handle URLs directly in setModel()
                    localStorage.setItem(MODEL_DOWNLOADED_KEY, 'true');
                    resolve();
                }
            } else {
                reject(new Error(`Download failed with HTTP ${xhr.status}`));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during model download'));
        xhr.ontimeout = () => reject(new Error('Model download timed out'));

        xhr.send();
    });
};

// ─── Initialization ───────────────────────────────────────────────────────────

/**
 * Initialize the local LLM. Call this once on app startup.
 * Emits progress events via onLLMProgress() throughout the process.
 * Safe to call multiple times — only initializes once per session.
 */
export const initializeLocalLLM = async (): Promise<{
    success: boolean;
    message: string;
}> => {
    if (_initialized) return { success: true, message: 'Already initialized' };

    const plugin = await getLLMPlugin();

    if (!plugin) {
        const msg = 'Running in browser — local AI not available. Deploy to a device.';
        _initError = msg;
        emitProgress({ phase: 'error', message: msg });
        return { success: false, message: msg };
    }

    try {
        // ── Step 1: Check availability ─────────────────────────────────────
        emitProgress({ phase: 'checking', message: 'Checking device AI capabilities…' });
        const availability = await plugin.systemAvailability();
        if (availability.status === 'unavailable') {
            const msg = 'This device does not meet the minimum requirements for local AI.';
            _initError = msg;
            emitProgress({ phase: 'error', message: msg });
            return { success: false, message: msg };
        }

        // ── Step 2: Download model if not already cached ───────────────────
        const alreadyDownloaded = await modelExistsLocally();

        if (!alreadyDownloaded) {
            emitProgress({
                phase: 'downloading',
                percent: 0,
                message: 'First launch: downloading AI model. This only happens once.',
            });

            try {
                await downloadModelWithProgress();
                _downloadedThisSession = true;
            } catch (downloadErr: any) {
                // If our XHR download fails, try letting the plugin handle the URL directly
                console.warn('[LocalLLM] XHR download failed, trying plugin URL fallback:', downloadErr.message);
                emitProgress({ phase: 'downloading', message: 'Downloading model via device…' });
                // Plugin's setModel with a URL will trigger its own download
                await plugin.setModel({ engine: MODEL_ENGINE, modelPath: MODEL_DOWNLOAD_URL });
                localStorage.setItem(MODEL_DOWNLOADED_KEY, 'true');
            }
        }

        // ── Step 3: Load model into memory ─────────────────────────────────
        emitProgress({ phase: 'loading', message: 'Loading AI model into memory…' });

        if (!_downloadedThisSession || !(await modelExistsLocally())) {
            // Model was already there — just configure the plugin with local file path
            await plugin.setModel({
                engine: MODEL_ENGINE,
                modelPath: MODEL_FILE_NAME, // Local filename
            });
        }

        // ── Step 4: Warm up session with system prompt ─────────────────────
        emitProgress({ phase: 'loading', message: 'Warming up Nnora…' });
        await plugin.warmup({
            sessionId: SESSION_ID,
            promptPrefix: NNORA_SYSTEM_PROMPT,
        });

        _initialized = true;
        emitProgress({ phase: 'ready', message: 'Nnora is ready!' });
        console.log('[LocalLLM] ✅ Initialized with', MODEL_FILE_NAME);
        return { success: true, message: 'Local LLM ready' };

    } catch (e: any) {
        const msg = e?.message || 'Unknown initialization error';
        _initError = msg;
        // Clear the download flag so next launch retries the download
        if (_downloadedThisSession) {
            localStorage.removeItem(MODEL_DOWNLOADED_KEY);
        }
        emitProgress({ phase: 'error', message: `AI failed to load: ${msg}` });
        console.error('[LocalLLM] Init error:', e);
        return { success: false, message: msg };
    }
};

// ─── Core Inference Helper ────────────────────────────────────────────────────

const parseJSON = <T>(raw: string, fallback: T): T => {
    let cleaned = raw.trim();
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) cleaned = cleaned.slice(start, end + 1);
    try {
        return JSON.parse(cleaned);
    } catch {
        return fallback;
    }
};

const runInference = async (promptText: string): Promise<string | null> => {
    const plugin = await getLLMPlugin();
    if (!plugin || !_initialized) return null;
    try {
        const result = await plugin.prompt({ sessionId: SESSION_ID, prompt: promptText });
        return result.response;
    } catch (e: any) {
        console.error('[LocalLLM] Inference error:', e);
        return null;
    }
};

// ─── Public API  ─────────────────────────

export const nnoraAgentChat = async (
    history: ChatMessage[],
    userMessage: string,
    fullContext: { learners: LearnerProfile[], artifacts: NnoraArtifact[] },
    userRole: UserRole,
    activeMode: NnoraMode
): Promise<{ text: string, action?: AgentAction }> => {

    if (!isCapacitor()) {
        return {
            text: '🔌 Nnora needs the mobile app for local AI. Your message was received — it will respond once running on a real device.'
        };
    }

    if (!_initialized) {
        return { text: 'Still warming up! Give me just a moment and try again. 😊' };
    }

    const recentHistory = history
        .filter(m => m.text?.trim().length > 0)
        .slice(-6)
        .map(m => {
            const role = m.role === 'user' ? 'Parent' : 'Nnora';
            const actionNote = m.action?.status === 'EXECUTED' ? `\n[Action done: ${m.action.type}]` : '';
            return `${role}: ${m.text}${actionNote}`;
        })
        .join('\n\n');

    const contextSummary = fullContext.learners.length > 0
        ? `Children on file: ${fullContext.learners.map(l => `${l.name} (${l.keyChallenges.join(', ')})`).join('; ')}.`
        : 'No children profiled yet.';

    const prompt = `CONTEXT: ${contextSummary}\nActive Mode: ${activeMode}\nTalking to: ${userRole}\n${recentHistory ? `\nCONVERSATION:\n${recentHistory}\n` : ''}\nParent: "${userMessage}"\n\nRespond as Nnora. JSON only, 3-4 sentences, one question.`;

    const raw = await runInference(prompt);
    if (!raw) return { text: 'Sorry, I had a hiccup. Could you say that again? 😊' };

    return parseJSON<{ text: string; action?: AgentAction }>(raw, {
        text: raw.length > 300 ? raw.slice(0, 300) + '...' : raw
    });
};

export const generateProactiveNudge = async (
    context: { learners: LearnerProfile[], artifacts: NnoraArtifact[] },
    userRole: UserRole
): Promise<string> => {
    if (!isCapacitor() || !_initialized) {
        const fallbacks = [
            'How are things going with your little ones today?',
            'Is there a learning moment you\'d like to talk through?',
            "How has your child been doing? I'd love to hear an update.",
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    const learnerNames = context.learners.map(l => l.name).join(', ') || 'your child';
    const prompt = `Generate a single warm, short, proactive check-in sentence from Nnora to a ${userRole}. Learners: ${learnerNames}. Specific and encouraging. Return ONLY the sentence, nothing else.`;

    const raw = await runInference(prompt);
    return raw?.trim() || 'How are things going with your learners today?';
};

export const generateNnoraArtifact = async (
    chatHistory: ChatMessage[]
): Promise<NnoraArtifact | null> => {
    if (!isCapacitor() || !_initialized) return null;

    const historyText = chatHistory.slice(-8)
        .map(m => `${m.role === 'user' ? 'Parent' : 'Nnora'}: ${m.text}`)
        .join('\n');

    const prompt = `Based on this conversation, extract a reusable Nnora Artifact as JSON:\n${historyText}\n\nReturn ONLY valid JSON:\n{\n  "title": "...",\n  "targetLearnerType": "...",\n  "concept": "...",\n  "sparkBreakdown": { "ignite": "...", "explore": "...", "create": "...", "reflect": "...", "transfer": "..." },\n  "notes": ["..."]\n}`;

    const raw = await runInference(prompt);
    if (!raw) return null;
    return parseJSON<NnoraArtifact | null>(raw, null);
};

export const getLLMStatus = () => ({
    initialized: _initialized,
    error: _initError,
    isMobile: isCapacitor(),
    modelName: MODEL_FILE_NAME,
    modelUrl: MODEL_DOWNLOAD_URL,
});
