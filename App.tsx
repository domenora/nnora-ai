
import React, { useState, useEffect } from 'react';
import { UserRole, AgentAction, LearnerProfile, NnoraArtifact, HistoryThread, FollowUpReminder } from './types';

// Components
import { Nnora } from './components/Nnora';
import { Sparkles, Download, Cpu, AlertTriangle, CheckCircle, WifiOff } from 'lucide-react';

// Services
import { initializeLocalLLM, onLLMProgress, getLLMStatus, type LLMProgressEvent } from './services/localLLMService';
import { storage } from './services/storageService';

// ─── Download / Init Screen ───────────────────────────────────────────────────

const LLMInitScreen = ({ progress }: { progress: LLMProgressEvent | null }) => {
  const phase = progress?.phase ?? 'checking';
  const percent = progress?.percent;
  const message = progress?.message ?? 'Starting up…';

  const isDownloading = phase === 'downloading';
  const isError = phase === 'error';
  const isLoading = phase === 'loading' || phase === 'checking';

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center px-6">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-400/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6 text-center">

        {/* Logo */}
        <div className={`w-20 h-20 bg-brand-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-600/30 transition-all duration-500 ${isError ? 'bg-amber-500 shadow-amber-500/30' : ''}`}>
          {isError
            ? <AlertTriangle className="text-white w-10 h-10" />
            : isDownloading
              ? <Download className="text-white w-10 h-10 animate-bounce" />
              : <Cpu className="text-white w-10 h-10 animate-pulse" />
          }
        </div>

        <div>
          <h1 className="text-2xl font-black text-[#1E1B4B] tracking-tight">Nnora</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">Powered by on-device AI</p>
        </div>

        {/* Progress card */}
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-lg p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isError ? 'bg-amber-100' : isDownloading ? 'bg-indigo-100' : 'bg-emerald-100'
            }`}>
              {isError
                ? <AlertTriangle className="w-4 h-4 text-amber-600" />
                : isDownloading
                  ? <Download className="w-4 h-4 text-indigo-600" />
                  : <Cpu className="w-4 h-4 text-emerald-600 animate-pulse" />
              }
            </div>
            <p className="text-sm font-semibold text-slate-700 text-left leading-snug">{message}</p>
          </div>

          {/* Progress bar — shown during downloading */}
          {isDownloading && (
            <div className="space-y-2">
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                {percent !== undefined ? (
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-indigo-400 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                ) : (
                  /* Indeterminate bar when Content-Length isn't known */
                  <div className="h-full w-1/3 bg-gradient-to-r from-brand-500 to-indigo-400 rounded-full animate-[slide_1.5s_ease-in-out_infinite]" />
                )}
              </div>
              {percent !== undefined && (
                <div className="flex justify-between text-[11px] text-gray-400 font-semibold">
                  <span>Downloading…</span>
                  <span>{percent}%</span>
                </div>
              )}
            </div>
          )}

          {/* Spinner for non-download loading phases */}
          {isLoading && (
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-gradient-to-r from-brand-400 to-purple-400 rounded-full animate-[slide_1.2s_ease-in-out_infinite]" />
            </div>
          )}

          {/* Error retry hint */}
          {isError && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-xl p-3 text-left leading-relaxed">
              Check your internet connection and relaunch the app. The AI model will be downloaded on first use.
            </p>
          )}
        </div>

        {/* First-launch explanation */}
        {isDownloading && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-left space-y-2">
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">One-time setup</p>
            <p className="text-sm text-indigo-600 leading-relaxed">
              Nnora uses a private AI that runs entirely on your device. No data ever leaves your phone. This download only happens once.
            </p>
          </div>
        )}
      </div>

      {/* Inline keyframes for the indeterminate bar */}
      <style>{`
        @keyframes slide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(150%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

// ─── Thin top banner (shown after ready when something's slightly wrong) ──────

const TopBanner = ({ state }: { state: 'browser' | 'error' }) => {
  const cfg = state === 'browser'
    ? { bg: 'bg-blue-50 border-blue-200 text-blue-700', icon: <WifiOff className="w-3.5 h-3.5" />, text: 'Browser mode — AI inference requires the mobile app.' }
    : { bg: 'bg-amber-50 border-amber-200 text-amber-700', icon: <AlertTriangle className="w-3.5 h-3.5" />, text: 'AI unavailable — check model file or internet connection.' };

  return (
    <div className={`fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 py-1.5 px-4 text-xs font-semibold border-b ${cfg.bg}`}>
      {cfg.icon}
      <span>{cfg.text}</span>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────

type AppPhase = 'boot' | 'llm-init' | 'ready' | 'error' | 'browser';

export default function App() {
  const [appPhase, setAppPhase] = useState<AppPhase>('boot');
  const [llmProgress, setLlmProgress] = useState<LLMProgressEvent | null>(null);

  // Nnora State
  const [storageReady, setStorageReady] = useState(false);
  const [threads, setThreads] = useState<HistoryThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
  const [learners, setLearners] = useState<LearnerProfile[]>([]);
  const [artifacts, setArtifacts] = useState<NnoraArtifact[]>([]);

  // ─── Bootstrap ─────────────────────────────────────────────────────────────

  useEffect(() => {
    // Subscribe to LLM progress events BEFORE calling initializeLocalLLM
    const unsubscribe = onLLMProgress((event) => {
      setLlmProgress(event);

      if (event.phase === 'ready') {
        // Small delay so user sees the "ready" state briefly
        setTimeout(() => setAppPhase('ready'), 600);
      } else if (event.phase === 'error') {
        const status = getLLMStatus();
        setAppPhase(status.isMobile ? 'error' : 'browser');
      } else {
        setAppPhase('llm-init');
      }
    });

    // Watchdog: if no progress event arrives within 20 s, unblock the UI
    const watchdog = setTimeout(() => {
      setAppPhase(prev => prev === 'boot' ? 'browser' : prev);
    }, 20_000);

    const bootstrap = async () => {
      // 1. Load persisted data
      const [savedThreads, savedReminders, savedLearners, savedArtifacts] = await Promise.all([
        storage.getJSON<HistoryThread[]>('nnora_threads', []),
        storage.getJSON<FollowUpReminder[]>('nnora_reminders', []),
        storage.getJSON<LearnerProfile[]>('nnora_learners', []),
        storage.getJSON<NnoraArtifact[]>('nnora_artifacts', []),
      ]);

      setThreads(savedThreads.map((t: any) => ({
        ...t,
        lastActive: new Date(t.lastActive),
        messages: t.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
      })));
      setReminders(savedReminders.map((r: any) => ({ ...r, scheduledFor: new Date(r.scheduledFor) })));
      setLearners(savedLearners);
      setArtifacts(savedArtifacts);
      setStorageReady(true);

      // 2. Initialize LLM (emits progress → handled by onLLMProgress above)
      await initializeLocalLLM();
    };

    bootstrap().catch(console.error);

    return () => { unsubscribe(); clearTimeout(watchdog); };
  }, []);

  // ─── Persist state ─────────────────────────────────────────────────────────

  useEffect(() => { if (storageReady) storage.setJSON('nnora_learners', learners); }, [learners, storageReady]);
  useEffect(() => { if (storageReady) storage.setJSON('nnora_artifacts', artifacts); }, [artifacts, storageReady]);
  useEffect(() => { if (storageReady) storage.setJSON('nnora_threads', threads); }, [threads, storageReady]);
  useEffect(() => { if (storageReady) storage.setJSON('nnora_reminders', reminders); }, [reminders, storageReady]);

  // ─── Action Handlers ───────────────────────────────────────────────────────

  const handleExecuteAction = (action: AgentAction) => {
    if (action.type === 'CREATE_LEARNER_PROFILE') {
      const newLearner: LearnerProfile = {
        id: `l-${Date.now()}`,
        name: action.data.name,
        keyChallenges: action.data.keyChallenges || [],
        capabilities: action.data.capabilities || { understanding: 3, manipulation: 3, expression: 3 },
        strengths: [],
        interactionHistory: [],
        observationMetrics: action.data.observationMetrics || [],
        assessmentMetrics: action.data.assessmentMetrics || [],
        reportSummary: action.data.reportSummary || ''
      };
      setLearners(prev => [...prev, newLearner]);
    }
    if (action.type === 'SAVE_ARTIFACT') {
      setArtifacts(prev => [...prev, {
        id: `art-${Date.now()}`,
        title: action.data.title,
        targetLearnerType: action.data.targetLearnerType,
        concept: action.data.concept,
        sparkBreakdown: action.data.sparkBreakdown,
        notes: action.data.notes || [],
        createdAt: new Date()
      }]);
    }
    if (action.type === 'UPDATE_LEARNER_PROFILE') {
      setLearners(prev => prev.map(l => l.id === action.data.learnerId ? {
        ...l,
        capabilities: action.data.progressUpdate || l.capabilities,
        observationMetrics: action.data.observationMetrics || l.observationMetrics,
        assessmentMetrics: action.data.assessmentMetrics || l.assessmentMetrics,
        reportSummary: action.data.reportSummary || l.reportSummary,
        interactionHistory: [...(l.interactionHistory || []), {
          date: new Date().toISOString(),
          whatWasTried: action.data.whatWasTried,
          whatWorked: action.data.whatWorked,
          whatDidnt: action.data.whatDidnt
        }]
      } : l));
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  // Show full-screen init UI during boot, downloading, and loading
  if (appPhase === 'boot' || appPhase === 'llm-init') {
    return <LLMInitScreen progress={llmProgress} />;
  }

  // Show full-screen error state (model failed to download/load)
  if (appPhase === 'error') {
    return <LLMInitScreen progress={llmProgress} />;
  }

  const contextData = { learners, artifacts };
  const hasBanner = appPhase === 'browser';

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1E1B4B] font-sans selection:bg-brand-500/30">
      {hasBanner && <TopBanner state="browser" />}

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0dcaf0]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#f97316]/5 blur-[120px] rounded-full" />
      </div>


      {/* Main */}
      <main className={`flex flex-col h-screen overflow-hidden ${hasBanner ? 'pt-24' : 'pt-16'}`}>
        <div className="flex-1 relative overflow-hidden">
          <Nnora
            mode="FULL_PAGE"
            contextData={contextData}
            threads={threads}
            setThreads={setThreads}
            activeThreadId={activeThreadId}
            setActiveThreadId={setActiveThreadId}
            reminders={reminders}
            setReminders={setReminders}
            userRole={UserRole.PARENT}
            onExecuteAction={handleExecuteAction}
          />
        </div>
      </main>
    </div>
  );
}
