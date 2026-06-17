import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  X,
  MessageSquare,
  ChevronDown,
  Maximize2,
  BookOpen,
  AlertCircle,
  ArrowRight,
  Loader2,
  Cpu,
  CheckCircle,
  Eye,
  Share2,
  Users,
  Sparkles,
  ClipboardList,
  Plus,
  History,
  Pin,
  Bell,
  Trash2,
  Sparkle,
  Edit2,
  Copy,
  Menu,
  PanelLeft,
  Printer,
  TrendingUp,
  Target,
  FileText,
  RefreshCw,
  Activity,
  Zap,
  Star,
  Clock,
  Save,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Cell,
} from "recharts";
import {
  ChatMessage,
  AgentAction,
  UserRole,
  NnoraMode,
  NnoraArtifact,
  LearnerProfile,
  HistoryThread,
  FollowUpReminder,
  EverydaySparkActivity,
  IepTranslation,
  TriageCategory,
  WinCard,
} from "../types";
import {
  nnoraAgentChat,
  generateProactiveNudge,
} from "../services/localLLMService";
import { Badge, Button } from "./Shared";
import { KnoraAvatar, ResourceViewer } from "./KnoraComponents";

// --- MAIN NNORA AGENT ---

export interface NnoraProps {
  contextData: { learners: LearnerProfile[]; artifacts: NnoraArtifact[] };
  onExecuteAction?: (action: AgentAction) => void;
  mode?: "FLOATING" | "FULL_PAGE";
  threads: HistoryThread[];
  setThreads: React.Dispatch<React.SetStateAction<HistoryThread[]>>;
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  reminders: FollowUpReminder[];
  setReminders: React.Dispatch<React.SetStateAction<FollowUpReminder[]>>;
  onExpand?: () => void;
  onClose?: () => void;
  userRole?: UserRole;
}

export const Nnora = ({
  contextData,
  onExecuteAction,
  mode = "FLOATING",
  threads,
  setThreads,
  activeThreadId,
  setActiveThreadId,
  reminders,
  setReminders,
  onExpand,
  onClose,
  userRole = UserRole.TEACHER,
}: NnoraProps) => {
  const [isOpen, setIsOpen] = useState(mode === "FULL_PAGE");
  const [activeMode, setActiveMode] = useState<NnoraMode>("CHAT");
  const [showSidebar, setShowSidebar] = useState(false);
  const [pinnedLearnerId, setPinnedLearnerId] = useState<string | null>(null);
  const [proactiveNudge, setProactiveNudge] = useState<string | null>(null);
  const [showNudgeBubble, setShowNudgeBubble] = useState(false);

  // Inputs
  const [input, setInput] = useState("");

  // Parent Tool States
  const [sparkStep, setSparkStep] = useState(1);
  const [sparkTarget, setSparkTarget] = useState("");
  const [sparkFixation, setSparkFixation] = useState("");
  const [sparkResources, setSparkResources] = useState("");
  const [generatedSpark, setGeneratedSpark] =
    useState<EverydaySparkActivity | null>(null);

  const [iepText, setIepText] = useState("");
  const [generatedIep, setGeneratedIep] = useState<IepTranslation | null>(null);

  const [triageCategory, setTriageCategory] = useState<TriageCategory | null>(
    null,
  );

  const [winCards, setWinCards] = useState<WinCard[]>([]);
  const [showWinForm, setShowWinForm] = useState(false);
  const [newWinActivity, setNewWinActivity] = useState("");
  const [newWinOutcome, setNewWinOutcome] = useState("");
  const [newWinMood, setNewWinMood] = useState<
    "HAPPY" | "CALM" | "FOCUSED" | "REGULATED" | "FRUSTRATED" | "TIRED"
  >("HAPPY");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [agentState, setAgentState] = useState<"IDLE" | "THINKING" | "ACTING">(
    "IDLE",
  );
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [selectedLearnerId, setSelectedLearnerId] = useState<string | null>(
    null,
  );
  const [learnerTab, setLearnerTab] = useState<
    "PROGRESS" | "HISTORY" | "REPORT"
  >("PROGRESS");

  // Viewer State
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    content: string;
    title: string;
    format: any;
    id: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;
  const messages = activeThread?.messages || [];

  // Auto-scroll
  useEffect(() => {
    if (isOpen || mode === "FULL_PAGE") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, agentState, executingId]);

  useEffect(() => {
    if (mode === "FULL_PAGE") setIsOpen(true);
  }, [mode]);

  // Proactive Nudge Logic
  useEffect(() => {
    const fetchNudge = async () => {
      const nudge = await generateProactiveNudge(contextData, userRole);
      setProactiveNudge(nudge);
      if (!isOpen && mode === "FLOATING") {
        setShowNudgeBubble(true);
        // Hide after 10 seconds
        setTimeout(() => setShowNudgeBubble(false), 10000);
      }
    };

    // Initial nudge after 3 seconds
    const timer = setTimeout(fetchNudge, 3000);

    // Periodic nudges every 5 minutes if idle
    const interval = setInterval(fetchNudge, 5 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [contextData, userRole, isOpen, mode]);

  const createNewThread = (learnerId?: string, initialText?: string) => {
    setActiveThreadId(null);
    if (learnerId) setPinnedLearnerId(learnerId);
    setActiveMode("CHAT");
    setShowSidebar(false);
    setIsOpen(true);
    setShowNudgeBubble(false);

    if (initialText) {
      handleAgentInteraction(initialText);
    } else {
      setInput("");
    }
  };

  const triggerLearnerUpdateNudge = (learnerId: string) => {
    const learner = contextData.learners.find((l) => l.id === learnerId);
    if (!learner) return;

    // Find or create thread
    let threadId = threads.find((t) => t.learnerId === learnerId)?.id;

    const nudgeText = `I've pulled up ${learner.name}'s profile. I'd love to hear an update on your last engagement with them—how are they progressing?`;
    const nnoraMsg: ChatMessage = {
      id: `nudge-${Date.now()}`,
      role: "model",
      text: nudgeText,
      timestamp: new Date(),
    };

    if (!threadId) {
      const newThread: HistoryThread = {
        id: `thread-${Date.now()}`,
        title: `Discussion: ${learner.name}`,
        learnerId,
        lastActive: new Date(),
        messages: [nnoraMsg],
        mode: "CHAT",
        status: "ACTIVE",
      };
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
    } else {
      setActiveThreadId(threadId);
      // Only add nudge if the last message wasn't already a nudge for this learner in the last 5 minutes
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === threadId) {
            const lastMsg = t.messages[t.messages.length - 1];
            if (lastMsg?.text === nudgeText) return t;
            return {
              ...t,
              messages: [...t.messages, nnoraMsg],
              lastActive: new Date(),
            };
          }
          return t;
        }),
      );
    }

    // Ensure we show the chat if in floating mode
    if (mode === "FLOATING") {
      setIsOpen(true);
      setActiveMode("CHAT");
    }
  };

  const handleOpenLearner = (learnerId: string) => {
    setSelectedLearnerId(learnerId);
    setPinnedLearnerId(learnerId);
    triggerLearnerUpdateNudge(learnerId);
  };

  const handlePinLearner = (learnerId: string | null) => {
    setPinnedLearnerId(learnerId);
    if (learnerId) {
      triggerLearnerUpdateNudge(learnerId);
    }
  };

  const handleGenerateSpark = () => {
    if (!sparkTarget || !sparkFixation || !sparkResources) return;
    setAgentState("THINKING");
    setTimeout(() => {
      setGeneratedSpark({
        id: Math.random().toString(),
        targetConcept: sparkTarget,
        childFixation: sparkFixation,
        nearbyResources: sparkResources,
        setupTime: "3 Minutes",
        storyHook: `We need to protect the base from a ${sparkFixation}! But they can only be navigated if we solve these ${sparkTarget} codes.`,
        playAction: `Using the ${sparkResources}, build a safe zone. Each time you progress through the concept, they add a piece to the safe zone.`,
        coolDown:
          "The base is safe! High five and take 3 deep breaths together.",
        createdAt: new Date(),
      });
      setAgentState("IDLE");
    }, 1500);
  };

  const handleTranslateIep = () => {
    if (!iepText) return;
    setAgentState("THINKING");
    setTimeout(() => {
      setGeneratedIep({
        id: Math.random().toString(),
        originalText: iepText,
        translatedJargon: [
          {
            jargon: "Decoding / Phonemic Awareness",
            translation: "Figuring out how to sound out words.",
          },
          {
            jargon: "Executive Function",
            translation:
              "The brain's management system (planning, organizing).",
          },
          {
            jargon: "Dysregulation",
            translation: "Overwhelmed nervous system; struggling to calm down.",
          },
        ],
        schoolObjective:
          "Improve reading fluency and word recognition without frustration.",
        homeActionPlan:
          "Instead of flashcards, label their favorite toys or household items with post-its and have them go on a 'scavenger hunt' to read and collect them.",
        createdAt: new Date(),
      });
      setAgentState("IDLE");
    }, 1800);
  };

  const handleSaveWin = () => {
    if (!newWinActivity || !newWinOutcome) return;
    const newWin: WinCard = {
      id: Math.random().toString(),
      date: new Date(),
      activityUsed: newWinActivity,
      outcomeDescr: newWinOutcome,
      childMood: newWinMood,
      createdAt: new Date(),
    };
    setWinCards([newWin, ...winCards]);
    setNewWinActivity("");
    setNewWinOutcome("");
    setNewWinMood("HAPPY");
    setShowWinForm(false);
  };

  const handleAgentInteraction = async (
    userText: string,
    targetThreadId?: string,
    isEdit: boolean = false,
    editIndex?: number,
  ) => {
    if (!userText.trim()) return;

    let currentThreadId = targetThreadId || activeThreadId;
    if (!currentThreadId) {
      const newThread: HistoryThread = {
        id: `thread-${Date.now()}`,
        title: userText.substring(0, 30) + "...",
        lastActive: new Date(),
        messages: [],
        mode: "CHAT",
        status: "ACTIVE",
      };
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
      currentThreadId = newThread.id;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
      timestamp: new Date(),
    };

    // Update thread with user message (and truncate if editing)
    setThreads((prev) =>
      prev.map((t) =>
        t.id === currentThreadId
          ? {
              ...t,
              messages:
                isEdit && editIndex !== undefined
                  ? [...t.messages.slice(0, editIndex), userMsg]
                  : [...t.messages, userMsg],
              lastActive: new Date(),
            }
          : t,
      ),
    );

    setInput("");
    setEditingMessageId(null);
    setAgentState("THINKING");

    // Prepare context with pinned learner
    const pinnedLearner = contextData.learners.find(
      (l) => l.id === pinnedLearnerId,
    );
    const chatContext = {
      learners: pinnedLearner ? [pinnedLearner] : contextData.learners,
      artifacts: contextData.artifacts,
    };

    const threadToUse = threads.find((t) => t.id === currentThreadId);
    const currentMessages =
      isEdit && editIndex !== undefined
        ? threadToUse?.messages.slice(0, editIndex) || []
        : threadToUse?.messages || [];

    const response = await nnoraAgentChat(
      [...currentMessages, userMsg],
      userText,
      chatContext,
      userRole,
      activeMode,
    );

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "model",
      text: response.text,
      timestamp: new Date(),
      action: response.action,
    };

    // Update thread with model response
    setThreads((prev) =>
      prev.map((t) =>
        t.id === currentThreadId
          ? {
              ...t,
              messages: [...t.messages, modelMsg],
              lastActive: new Date(),
              title:
                t.messages.length <= 1
                  ? userText.substring(0, 30) + "..."
                  : t.title,
            }
          : t,
      ),
    );

    if (response.action) {
      // Handle follow-up scheduling if suggested in text or action
      if (
        response.text.toLowerCase().includes("follow up") ||
        response.text.toLowerCase().includes("tomorrow")
      ) {
        const newReminder: FollowUpReminder = {
          id: `rem-${Date.now()}`,
          learnerId: pinnedLearnerId || "general",
          threadId: currentThreadId!,
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h later
          prompt: `How did the intervention for ${pinnedLearner?.name || "the learner"} go?`,
          status: "PENDING",
        };
        setReminders((prev) => [...prev, newReminder]);
      }
    }

    setAgentState("IDLE");
  };

  const confirmAction = async (msgId: string | null, action: AgentAction) => {
    const uniqueId =
      msgId || `hist-${action.type}-${JSON.stringify(action.data).length}`;
    setExecutingId(uniqueId);
    setAgentState("ACTING");

    await new Promise((r) => setTimeout(r, 1500));

    let resultData = action.data;
    let executionSuccess = true;

    if (executionSuccess) {
      if (msgId && activeThreadId) {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThreadId
              ? {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === msgId && m.action
                      ? {
                          ...m,
                          action: {
                            ...m.action,
                            status: "EXECUTED",
                            data: resultData,
                          },
                        }
                      : m,
                  ),
                }
              : t,
          ),
        );
      }

      if (onExecuteAction) onExecuteAction({ ...action, data: resultData });

      if (
        action.type === "GENERATE_ACTION_PLAN" ||
        action.type === "SAVE_ARTIFACT"
      ) {
        openArtifactPreview(action);
      }
    } else {
      alert("Execution failed. Please try again.");
    }

    setExecutingId(null);
    setAgentState("IDLE");
  };

  const openArtifactPreview = (action: AgentAction) => {
    let content = "";
    let title = action.data.title || "Nnora Output";

    if (action.type === "GENERATE_ACTION_PLAN") {
      content = `# ${title}\n\n`;
      action.data.steps?.forEach(
        (step: string, i: number) => (content += `${i + 1}. ${step}\n`),
      );
      content += "\n\n*Try this and let me know how it goes!*";
    } else if (action.type === "SAVE_ARTIFACT") {
      content = `# Artifact: ${title}\n\n`;
      content += `**Target:** ${action.data.targetLearnerType}\n`;
      content += `**Concept:** ${action.data.concept}\n\n`;
      content += `## Spark Breakdown\n`;
      content += `- **Ignite:** ${action.data.sparkBreakdown?.ignite}\n`;
      content += `- **Explore:** ${action.data.sparkBreakdown?.explore}\n`;
      content += `- **Create:** ${action.data.sparkBreakdown?.create}\n`;
      content += `- **Reflect:** ${action.data.sparkBreakdown?.reflect}\n`;
      content += `- **Transfer:** ${action.data.sparkBreakdown?.transfer}\n\n`;
      content += `## Notes\n`;
      action.data.notes?.forEach((note: string) => (content += `- ${note}\n`));
    }

    setViewerState({
      isOpen: true,
      content,
      title,
      format: "markdown",
      id: `nnora-${Date.now()}`,
    });
  };

  const renderActionCard = (action: AgentAction, msgId?: string) => {
    if (action.type === "NONE") return null;
    const isExecuted = action.status === "EXECUTED";
    const uniqueId =
      msgId || `hist-${action.type}-${JSON.stringify(action.data).length}`;
    const isExecuting = executingId === uniqueId;

    const readableActionName = action.type.toLowerCase().replace(/_/g, " ");

    if (isExecuting) {
      return (
        <div className="mt-3 bg-white rounded-[10px] p-6 border border-brand-500/30 flex flex-col items-center justify-center gap-3 animate-pulse">
          <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
          <span className="text-sm text-brand-100 italic font-medium">
            Processing {readableActionName}...
          </span>
        </div>
      );
    }

    return (
      <div
        className={`mt-3 rounded-xl p-0.5 relative group overflow-hidden ${isExecuted ? "bg-green-500/20" : "bg-gradient-to-r from-brand-500 to-purple-500"}`}
      >
        <div className="bg-white rounded-[10px] p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] font-bold text-brand-300 uppercase tracking-widest flex items-center gap-1">
                <Cpu size={12} />{" "}
                {isExecuted ? "Action Executed" : "Proposed Action"}
              </span>
              {isExecuted && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                  <CheckCircle size={10} /> COMPLETED
                </span>
              )}
            </div>

            <div className="mb-4">
              <h4 className="text-[#1E1B4B] text-sm font-bold mb-1 capitalize">
                {readableActionName}
              </h4>
              {action.summary && (
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {action.summary}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {isExecuted &&
                (action.type === "SAVE_ARTIFACT" ||
                  action.type === "GENERATE_ACTION_PLAN") && (
                  <button
                    onClick={() => openArtifactPreview(action)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-[#1E1B4B] text-xs font-bold py-2 rounded-lg border border-gray-200 transition-all"
                  >
                    <Eye size={14} /> View Result
                  </button>
                )}
              {!isExecuted && (
                <button
                  onClick={() => confirmAction(msgId || null, action)}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2.5 rounded-lg shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                >
                  Approve & Execute
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: show a toast or feedback
  };

  const handleEditMessage = (msg: ChatMessage, index: number) => {
    setEditingMessageId(msg.id);
    setEditInput(msg.text);
  };

  const submitEdit = (index: number) => {
    handleAgentInteraction(editInput, activeThreadId || undefined, true, index);
  };

  const containerClasses =
    mode === "FULL_PAGE"
      ? "fixed inset-0 top-16 z-30 w-full bg-[#FDFCF8] flex overflow-hidden animate-fade-in"
      : `bg-[#FDFCF8] rounded-2xl shadow-2xl border border-gray-200 w-[calc(100vw-2rem)] sm:w-[420px] mb-4 overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto flex flex-col font-sans relative ${isOpen ? "scale-100 opacity-100 h-[75vh] sm:h-[650px]" : "scale-75 opacity-0 h-0 w-0 mb-0"}`;

  const sidebar = (
    <div
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${showSidebar ? "w-72" : "w-0 overflow-hidden"}`}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <PanelLeft size={14} /> Nnora Space
        </h3>
        <button
          onClick={() => {
            createNewThread();
            setShowSidebar(false);
          }}
          className="p-1.5 bg-brand-600/20 text-brand-400 hover:bg-brand-600 hover:text-white rounded-lg transition-all"
          title="New Chat"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-6">
        {/* LEARNERS SECTION */}
        <div>
          <button
            onClick={() => {
              setActiveMode("LEARNERS");
              setShowSidebar(false);
            }}
            className={`w-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-between group rounded-lg transition-all ${activeMode === "LEARNERS" ? "bg-brand-600/10 text-brand-400" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"}`}
          >
            <div className="flex items-center gap-2">
              <Users size={12} /> My Children
            </div>
            <ArrowRight
              size={10}
              className="opacity-0 group-hover:opacity-100 transition-all"
            />
          </button>
        </div>

        {/* PARENT TOOLS SECTION */}
        <div>
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Parent Tools
          </div>
          <button
            onClick={() => {
              setActiveMode("ACADEMICS");
              setShowSidebar(false);
            }}
            className={`w-full px-3 py-2 text-xs font-semibold mb-1 flex items-center gap-2 rounded-lg transition-all ${activeMode === "ACADEMICS" ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
          >
            <BookOpen size={14} /> Academics
          </button>
          <button
            onClick={() => {
              setActiveMode("STORY_PLAY");
              setShowSidebar(false);
            }}
            className={`w-full px-3 py-2 text-xs font-semibold mb-1 flex items-center gap-2 rounded-lg transition-all ${activeMode === "STORY_PLAY" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
          >
            <Sparkles size={14} /> Story & Play
          </button>
        </div>

        {/* ARTIFACTS SECTION */}
        <div>
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Library
          </div>
          <button
            onClick={() => {
              setActiveMode("ARTIFACTS");
              setShowSidebar(false);
            }}
            className={`w-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-between group rounded-lg transition-all ${activeMode === "ARTIFACTS" ? "bg-brand-600/10 text-brand-400" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"}`}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={12} /> Artifacts
            </div>
            <ArrowRight
              size={10}
              className="opacity-0 group-hover:opacity-100 transition-all"
            />
          </button>
        </div>

        {/* HISTORY SECTION */}
        <div>
          <button
            onClick={() => {
              setActiveMode("CHAT");
              setShowSidebar(false);
            }}
            className={`w-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-between group rounded-lg transition-all ${activeMode === "CHAT" ? "bg-brand-600/10 text-brand-400" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"}`}
          >
            <div className="flex items-center gap-2">
              <History size={12} /> History
            </div>
            <ArrowRight
              size={10}
              className="opacity-0 group-hover:opacity-100 transition-all"
            />
          </button>
          <div className="space-y-1">
            {threads.map((thread) => (
              <div
                key={thread.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setActiveThreadId(thread.id);
                    setActiveMode("CHAT");
                    setShowSidebar(false);
                  }
                }}
                onClick={() => {
                  setActiveThreadId(thread.id);
                  setActiveMode("CHAT");
                  setShowSidebar(false);
                }}
                className={`w-full text-left p-2 rounded-lg transition-all group relative flex items-center gap-2 cursor-pointer ${activeThreadId === thread.id && activeMode === "CHAT" ? "bg-gray-50 border border-gray-200" : "hover:bg-gray-50/50 border border-transparent"}`}
              >
                <MessageSquare
                  size={12}
                  className={
                    activeThreadId === thread.id && activeMode === "CHAT"
                      ? "text-brand-400"
                      : "text-gray-600"
                  }
                />
                <span className="text-xs text-gray-700 truncate flex-1">
                  {thread.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setThreads((prev) =>
                      prev.filter((t) => t.id !== thread.id),
                    );
                    if (activeThreadId === thread.id) setActiveThreadId(null);
                  }}
                  className="p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {threads.length === 0 && (
              <p className="px-3 text-[10px] text-gray-600 italic">
                No history yet
              </p>
            )}
          </div>
        </div>
      </div>

      {reminders.filter((r) => r.status === "PENDING").length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-white/50">
          <h4 className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Bell size={12} /> Follow-ups
          </h4>
          <div className="space-y-2">
            {reminders
              .filter((r) => r.status === "PENDING")
              .slice(0, 2)
              .map((reminder) => (
                <div
                  key={reminder.id}
                  className="bg-gray-50/50 border border-brand-500/20 rounded-lg p-2 text-[10px] text-gray-700"
                >
                  <p className="line-clamp-2 mb-1">{reminder.prompt}</p>
                  <button
                    onClick={() => {
                      setActiveThreadId(reminder.threadId);
                      handleAgentInteraction(
                        "I'm ready for the follow-up on this situation.",
                      );
                      setReminders((prev) =>
                        prev.map((r) =>
                          r.id === reminder.id ? { ...r, status: "SENT" } : r,
                        ),
                      );
                      setShowSidebar(false);
                    }}
                    className="text-brand-400 font-bold hover:underline"
                  >
                    Respond Now
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  const mainContent = (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FDFCF8] relative">
      {viewerState?.isOpen && (
        <ResourceViewer
          initialContent={viewerState.content}
          title={viewerState.title}
          format={viewerState.format}
          onClose={() => setViewerState(null)}
          onUpdate={(newContent) => {
            setViewerState((prev) =>
              prev ? { ...prev, content: newContent } : null,
            );
          }}
        />
      )}

      {/* HEADER */}
      <div className="bg-white px-4 py-3 flex justify-between items-center shrink-0 border-b border-gray-200 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 text-gray-500 hover:text-[#1E1B4B] hover:bg-gray-50 rounded-lg transition-all"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
              <KnoraAvatar className="w-8 h-8" />
            </div>
            <span className="text-lg font-black text-[#1E1B4B] tracking-tight">
              Nnora
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => {
              createNewThread();
              setActiveMode("CHAT");
            }}
            className="text-gray-500 hover:text-[#1E1B4B] p-2 hover:bg-gray-50 rounded-lg transition-colors"
            title="New Chat"
          >
            <Plus size={20} />
          </button>
          {mode === "FULL_PAGE" && onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-[#1E1B4B] p-2 hover:bg-gray-50 rounded-lg transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          )}
          {mode === "FLOATING" && onExpand && (
            <button
              onClick={onExpand}
              className="text-gray-500 hover:text-[#1E1B4B] p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Maximize2 size={18} />
            </button>
          )}
          {mode === "FLOATING" && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-[#1E1B4B] p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ChevronDown size={20} />
            </button>
          )}
        </div>
      </div>

      {/* LEARNER PIN BAR */}
      {activeMode === "CHAT" && (
        <div className="bg-white/50 border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-2">
            <Pin
              size={12}
              className={pinnedLearnerId ? "text-brand-400" : "text-gray-600"}
            />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Active Child:
            </span>
            <select
              value={pinnedLearnerId || ""}
              onChange={(e) => handlePinLearner(e.target.value || null)}
              className="bg-transparent text-xs font-bold text-gray-700 outline-none border-none focus:ring-0 cursor-pointer hover:text-[#1E1B4B] transition-colors"
            >
              <option value="">None (General)</option>
              {contextData.learners.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          {pinnedLearnerId && (
            <div className="flex gap-1">
              {["U", "M", "E"].map((cap, i) => {
                const learner = contextData.learners.find(
                  (l) => l.id === pinnedLearnerId,
                );
                const val = learner
                  ? i === 0
                    ? learner.capabilities.understanding
                    : i === 1
                      ? learner.capabilities.manipulation
                      : learner.capabilities.expression
                  : 0;
                return (
                  <div
                    key={cap}
                    className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200"
                    title={`${cap === "U" ? "Understanding" : cap === "M" ? "Manipulation" : "Expression"}: ${val}/5`}
                  >
                    <span className="text-[8px] font-bold text-gray-500">
                      {cap}
                    </span>
                    <div className="w-8 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500"
                        style={{ width: `${(val / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#FDFCF8] relative">
        {activeMode === "CHAT" && (
          <>
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10">
              {!activeThreadId && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 border border-gray-200 shadow-2xl">
                    <KnoraAvatar className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1E1B4B] mb-2">
                    Hello, I'm Nnora.
                  </h3>
                  <p className="text-gray-500 text-sm mb-10 max-w-sm mx-auto">
                    Your fellow parent and guide. Let's talk about your child.
                    How's it going with them today?
                  </p>

                  <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
                    <button
                      onClick={() =>
                        setInput(
                          "My child had a meltdown today and I didn't know what to do.",
                        )
                      }
                      className="text-left p-4 bg-white/50 border border-gray-200 rounded-xl hover:border-brand-500/50 hover:bg-white transition-all text-sm text-gray-700"
                    >
                      "My child had a meltdown today and I didn't know what to
                      do."
                    </button>
                    <button
                      onClick={() =>
                        setInput(
                          "We are struggling with homework. How can we make it playful?",
                        )
                      }
                      className="text-left p-4 bg-white/50 border border-gray-200 rounded-xl hover:border-brand-500/50 hover:bg-white transition-all text-sm text-gray-700"
                    >
                      "We are struggling with homework. How can we make it
                      playful?"
                    </button>
                    <button
                      onClick={() =>
                        setInput(
                          "I'd like to create a support profile for my child.",
                        )
                      }
                      className="text-left p-4 bg-white/50 border border-gray-200 rounded-xl hover:border-brand-500/50 hover:bg-white transition-all text-sm text-gray-700"
                    >
                      "I'd like to create a support profile for my child."
                    </button>
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-fade-in-up group/msg`}
                >
                  {msg.role === "model" && (
                    <div className="w-16 h-16 shrink-0">
                      <KnoraAvatar />
                    </div>
                  )}
                  <div
                    className={`flex flex-col max-w-[88%] ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`relative p-5 rounded-3xl leading-relaxed shadow-sm ${msg.role === "user" ? "bg-brand-600 text-white rounded-tr-none text-base" : "bg-white border border-gray-200 text-[#1E1B4B] rounded-tl-none text-xl font-medium tracking-tight"}`}
                    >
                      {editingMessageId === msg.id ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <textarea
                            className="w-full bg-gray-50 text-[#1E1B4B] text-sm p-2 rounded border border-brand-400 focus:ring-0 resize-none"
                            value={editInput}
                            onChange={(e) => setEditInput(e.target.value)}
                            rows={3}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingMessageId(null)}
                              className="px-3 py-1 text-[10px] font-bold text-gray-500 hover:text-[#1E1B4B]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => submitEdit(idx)}
                              className="px-3 py-1 bg-white text-brand-600 rounded text-[10px] font-bold"
                            >
                              Save & Submit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                          {msg.role === "user" && (
                            <div className="absolute right-0 top-full mt-1 flex gap-2 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditMessage(msg, idx)}
                                className="p-1 text-gray-500 hover:text-[#1E1B4B] transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleCopyText(msg.text)}
                                className="p-1 text-gray-500 hover:text-[#1E1B4B] transition-colors"
                                title="Copy"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          )}
                          {msg.role === "model" && (
                            <div className="absolute left-0 top-full mt-1 flex gap-2 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleCopyText(msg.text)}
                                className="p-1 text-gray-500 hover:text-[#1E1B4B] transition-colors"
                                title="Copy"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {msg.role === "model" && msg.action && (
                      <div className="w-full mt-1 pl-1">
                        {renderActionCard(msg.action, msg.id)}
                      </div>
                    )}
                    <span className="text-[9px] text-gray-600 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {agentState === "THINKING" && (
                <div className="flex gap-4 animate-fade-in">
                  <div className="w-16 h-16 shrink-0">
                    <KnoraAvatar mood="THINKING" />
                  </div>
                  <div className="bg-white border border-gray-200 p-5 rounded-3xl rounded-tl-none flex gap-2 items-center">
                    <span className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-bounce"></span>
                    <span className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="bg-white border-t border-gray-200 p-3 shrink-0 relative z-20">
              <div className="flex items-end gap-2 bg-[#FDFCF8] border border-gray-200 rounded-xl p-1">
                <textarea
                  className="flex-1 bg-transparent border-none px-4 py-3 text-sm focus:ring-0 text-[#1E1B4B] placeholder-slate-600 resize-none max-h-32"
                  placeholder={
                    activeThreadId
                      ? "Describe the situation or your child's struggle..."
                      : "Type here to tell Nnora about your child..."
                  }
                  value={input}
                  disabled={agentState !== "IDLE"}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAgentInteraction(input);
                    }
                  }}
                  rows={1}
                />
                <button
                  onClick={() => handleAgentInteraction(input)}
                  disabled={!input.trim() || agentState !== "IDLE"}
                  className="bg-brand-600 hover:bg-brand-500 text-[#1E1B4B] p-3 rounded-lg shadow-lg shadow-brand-900/50 transition-all active:scale-95 disabled:opacity-50 mb-0.5"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}

        {activeMode === "ARTIFACTS" && (
          <div className="flex-1 bg-[#FDFCF8] p-4 overflow-y-auto">
            <div className="mb-6">
              <button
                onClick={() =>
                  createNewThread(
                    undefined,
                    "I'd like to create a new learning artifact. Can you help me design something effective?",
                  )
                }
                className="w-full p-4 bg-brand-600/10 border border-brand-500/20 rounded-2xl text-brand-400 text-sm font-bold hover:bg-brand-600 hover:text-[#1E1B4B] transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Create New Artifact
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {contextData.artifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-brand-500/50 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <Badge color="blue">{artifact.targetLearnerType}</Badge>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {artifact.id}
                    </span>
                  </div>
                  <h4 className="text-[#1E1B4B] font-bold mb-2 group-hover:text-brand-400 transition-colors">
                    {artifact.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                    {artifact.concept}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setViewerState({
                          isOpen: true,
                          content: artifact.concept,
                          title: artifact.title,
                          format: "markdown",
                          id: artifact.id,
                        })
                      }
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-[#1E1B4B] text-[10px] font-bold py-2 rounded-lg border border-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={12} /> View
                    </button>
                    <button className="p-2 bg-gray-50 hover:bg-brand-600 text-gray-500 hover:text-[#1E1B4B] rounded-lg transition-all">
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {contextData.artifacts.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
                  <Sparkles
                    size={32}
                    className="mx-auto text-slate-700 mb-4 opacity-20"
                  />
                  <p className="text-gray-500 text-sm font-medium">
                    No artifacts saved yet.
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Artifacts are generated during chat interactions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeMode === "ACADEMICS" && (
          <div className="flex-1 bg-[#FDFCF8] p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-6">
                <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1E1B4B]">
                    Academics Support
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Upload an assignment, get answers or a step-by-step teaching
                    guide.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 mb-6 text-center hover:border-brand-400 hover:bg-gray-50 transition-colors cursor-pointer">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2 font-bold">
                    Click to upload an Image or PDF of the assignment
                  </p>
                  <p className="text-xs text-gray-500">
                    Nnora will analyze the problem immediately.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setActiveMode("CHAT");
                      handleAgentInteraction(
                        "I need a step-by-step teaching guide to help my child understand this assignment. Please break it down and guide me on how to teach it.",
                      );
                    }}
                    className="p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Sparkle size={20} />
                    Step-by-Step Guide
                  </button>
                  <button
                    onClick={() => {
                      setActiveMode("CHAT");
                      handleAgentInteraction(
                        "Just give me the answers to these assignment questions straight away.",
                      );
                    }}
                    className="p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <CheckCircle size={20} />
                    Just Answer
                  </button>
                  <button
                    onClick={() => {
                      setActiveMode("CHAT");
                      handleAgentInteraction(
                        "Generate some practice questions and examples similar to this assignment.",
                      );
                    }}
                    className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <FileText size={20} />
                    Generate Questions
                  </button>
                  <button
                    onClick={() => {
                      setActiveMode("CHAT");
                      handleAgentInteraction(
                        "Provide further learning resources and materials related to this topic.",
                      );
                    }}
                    className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <BookOpen size={20} />
                    Further Resources
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMode === "STORY_PLAY" && (
          <div className="flex-1 bg-[#FDFCF8] p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1E1B4B]">
                    Story & Play Architect
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Create deliberate, progressive story experiences with
                    embedded play and creativity activities.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Target Learner
                  </label>
                  <select
                    value={selectedLearnerId || ""}
                    onChange={(e) => setSelectedLearnerId(e.target.value)}
                    className="w-full text-base p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[#1E1B4B]"
                  >
                    <option value="" disabled>
                      Select a child
                    </option>
                    {contextData.learners.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Curriculum / Topic
                    </label>
                    <input
                      type="text"
                      className="w-full text-base p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[#1E1B4B]"
                      placeholder="e.g., Solar System"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Style / Theme
                    </label>
                    <input
                      type="text"
                      className="w-full text-base p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[#1E1B4B]"
                      placeholder="e.g., Sci-Fi Adventure"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Learning Pattern
                    </label>
                    <input
                      type="text"
                      className="w-full text-base p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[#1E1B4B]"
                      placeholder="e.g., Repetition, Hands-on"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Pedagogical Approach
                    </label>
                    <input
                      type="text"
                      className="w-full text-base p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[#1E1B4B]"
                      placeholder="e.g., Montessori, Project-Based"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Specific Focus / Goals
                  </label>
                  <textarea
                    className="w-full h-24 text-base p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-[#1E1B4B] resize-none"
                    placeholder="e.g., Improve attention span and sequential instructions."
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setActiveMode("CHAT");
                      handleAgentInteraction(
                        "Please generate a progressive Story & Play resource based on the curriculum and approach details provided.",
                      );
                    }}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                  >
                    <Sparkles size={16} /> Generate Resource
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMode === "LEARNERS" && (
          <div className="flex-1 bg-[#FDFCF8] p-4 overflow-y-auto">
            {!selectedLearnerId ? (
              <>
                <div className="mb-6">
                  <button
                    onClick={() =>
                      createNewThread(
                        undefined,
                        "I'd like to build a support profile for my child.",
                      )
                    }
                    className="w-full p-4 bg-brand-600/10 border border-brand-500/20 rounded-2xl text-brand-400 text-sm font-bold hover:bg-brand-600 hover:text-[#1E1B4B] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add My Child
                  </button>
                </div>
                <div className="space-y-4">
                  {contextData.learners.map((learner) => (
                    <div
                      key={learner.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-500/50 transition-all cursor-pointer"
                      onClick={() => handleOpenLearner(learner.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {learner.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-[#1E1B4B] font-bold text-sm">
                              {learner.name}
                            </h4>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                              Child's Profile
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              createNewThread(learner.id);
                            }}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm"
                            title="Chat with Nnora about this child"
                          >
                            <MessageSquare size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
                            Academic Focus Areas
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {learner.keyChallenges.slice(0, 3).map((c, i) => (
                              <Badge key={i} color="blue">
                                {c}
                              </Badge>
                            ))}
                            {learner.keyChallenges.length > 3 && (
                              <span className="text-[10px] text-gray-600">
                                +{learner.keyChallenges.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {["U", "M", "E"].map((cap, i) => {
                            const val =
                              i === 0
                                ? learner.capabilities.understanding
                                : i === 1
                                  ? learner.capabilities.manipulation
                                  : learner.capabilities.expression;
                            return (
                              <div
                                key={cap}
                                className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-center"
                              >
                                <p className="text-[8px] text-gray-400 uppercase font-bold">
                                  {cap === "U"
                                    ? "Cognitive"
                                    : cap === "M"
                                      ? "Language"
                                      : "Academic"}
                                </p>
                                <p className="text-[#1E1B4B] font-bold text-xs">
                                  {val}/5
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {contextData.learners.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
                      <Users
                        size={32}
                        className="mx-auto text-slate-700 mb-4 opacity-20"
                      />
                      <p className="text-gray-500 text-sm font-medium">
                        No learners added yet.
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        Add a learner to start tracking progress.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              (() => {
                const learner = contextData.learners.find(
                  (l) => l.id === selectedLearnerId,
                );
                if (!learner) return null;

                return (
                  <div className="h-full flex flex-col animate-fade-in">
                    <div className="flex items-center gap-4 mb-6">
                      <button
                        onClick={() => setSelectedLearnerId(null)}
                        className="p-2 text-gray-500 hover:text-[#1E1B4B] hover:bg-gray-50 rounded-lg transition-all"
                      >
                        <PanelLeft size={20} className="rotate-180" />
                      </button>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#1E1B4B]">
                          {learner.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Progress Metrics & Analysis
                        </p>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="p-2 bg-gray-50 text-gray-700 hover:text-[#1E1B4B] rounded-lg border border-gray-200 transition-all flex items-center gap-2 text-xs font-bold"
                      >
                        <Printer size={16} /> Print Report
                      </button>
                    </div>

                    {/* TABS */}
                    <div className="flex border-b border-gray-200 mb-6">
                      {[
                        { id: "PROGRESS", label: "Progress", icon: TrendingUp },
                        { id: "HISTORY", label: "History", icon: History },
                        { id: "REPORT", label: "Report", icon: FileText },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setLearnerTab(tab.id as any)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all border-b-2 ${learnerTab === tab.id ? "text-blue-600 border-blue-600 bg-blue-50" : "text-gray-500 border-transparent hover:text-gray-700"}`}
                        >
                          <tab.icon size={14} /> {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* TAB CONTENT */}
                    <div className="flex-1 overflow-y-auto">
                      {learnerTab === "PROGRESS" && (
                        <div className="space-y-6">
                          <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-2">
                                <TrendingUp
                                  size={16}
                                  className="text-blue-500"
                                />{" "}
                                Cognitive & Academic Progress
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  createNewThread(
                                    learner.id,
                                    "Can you review my child's recent academic progress and give me some advice?",
                                  );
                                }}
                                className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors flex items-center gap-1"
                              >
                                <MessageSquare size={12} /> Ask Nnora
                              </button>
                            </div>
                            <div className="h-64 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart
                                  cx="50%"
                                  cy="50%"
                                  outerRadius="80%"
                                  data={[
                                    {
                                      subject: "Cognitive",
                                      A: learner.capabilities.understanding,
                                      fullMark: 5,
                                    },
                                    {
                                      subject: "Language",
                                      A: learner.capabilities.manipulation,
                                      fullMark: 5,
                                    },
                                    {
                                      subject: "Academic",
                                      A: learner.capabilities.expression,
                                      fullMark: 5,
                                    },
                                    ...(learner.observationMetrics?.map(
                                      (m) => ({
                                        subject: m.category,
                                        A: m.level,
                                        fullMark: 5,
                                      }),
                                    ) || []),
                                  ]}
                                >
                                  <PolarGrid stroke="#e2e8f0" />
                                  <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{
                                      fill: "#64748b",
                                      fontSize: 10,
                                      fontWeight: 600,
                                    }}
                                  />
                                  <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 5]}
                                    tick={false}
                                    axisLine={false}
                                  />
                                  <Radar
                                    name={learner.name}
                                    dataKey="A"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.6}
                                  />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-4 italic text-center">
                              This chart tracks your child's ongoing development
                              based on the activities and feedback you've
                              shared.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            {(learner.observationMetrics || []).map(
                              (metric, i) => (
                                <div
                                  key={i}
                                  className="bg-white/50 border border-gray-200 rounded-xl p-4"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="text-xs font-bold text-[#1E1B4B]">
                                      {metric.category}
                                    </h5>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${metric.level > 3 ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}
                                    >
                                      Level {metric.level}/5
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 leading-relaxed">
                                    {metric.description}
                                  </p>
                                </div>
                              ),
                            )}
                            {(!learner.observationMetrics ||
                              learner.observationMetrics.length === 0) && (
                              <div className="text-center py-10 bg-white/30 rounded-xl border border-gray-200 border-dashed">
                                <p className="text-xs text-gray-500">
                                  No specific metrics yet. Chat with Nnora after
                                  doing some tasks to update this!
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {learnerTab === "HISTORY" && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                              Journey & Milestones
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                createNewThread(
                                  learner.id,
                                  "Looking at our past history, what new activity should we try next?",
                                );
                              }}
                              className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors flex items-center gap-1"
                            >
                              <Sparkles size={12} /> Get Nnora's Advice
                            </button>
                          </div>
                          <div className="space-y-4">
                            {(learner.interactionHistory || []).map(
                              (entry, i) => (
                                <div
                                  key={i}
                                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                      <History size={16} />
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                                        {new Date(
                                          entry.date,
                                        ).toLocaleDateString()}
                                      </p>
                                      <h5 className="text-xs font-bold text-[#1E1B4B]">
                                        Activity: {entry.whatWasTried}
                                      </h5>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                                    <div className="bg-green-50/50 border border-green-100 rounded-lg p-3">
                                      <strong className="text-green-700 block mb-1 uppercase text-[10px] tracking-widest">
                                        What Worked
                                      </strong>
                                      <span className="text-gray-700 leading-relaxed">
                                        {entry.whatWorked || "—"}
                                      </span>
                                    </div>
                                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-3">
                                      <strong className="text-red-700 block mb-1 uppercase text-[10px] tracking-widest">
                                        Challenges
                                      </strong>
                                      <span className="text-gray-700 leading-relaxed">
                                        {entry.whatDidnt || "—"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                            {(!learner.interactionHistory ||
                              learner.interactionHistory.length === 0) && (
                              <div className="text-center py-10 bg-white/30 rounded-xl border border-gray-200 border-dashed">
                                <p className="text-xs text-gray-500">
                                  No activity history recorded. Start working
                                  with your child and tell Nnora how it went!
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {learnerTab === "REPORT" && (
                        <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
                          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-6">
                            <div>
                              <h2 className="text-2xl font-black text-[#1E1B4B] uppercase tracking-tighter">
                                Child Progress Report
                              </h2>
                              <p className="text-gray-500 text-sm font-medium">
                                Generated on {new Date().toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Parent / Guardian
                              </p>
                              <p className="text-sm font-bold">{userRole}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                              <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                  Learner Name
                                </p>
                                <p className="text-lg font-bold">
                                  {learner.name}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                  Academic Focus Areas
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {learner.keyChallenges.map((c, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase"
                                    >
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                                Core Learning Capabilities
                              </p>
                              <div className="space-y-3">
                                {[
                                  [
                                    "Cognitive",
                                    learner.capabilities.understanding,
                                  ],
                                  [
                                    "Language",
                                    learner.capabilities.manipulation,
                                  ],
                                  ["Academic", learner.capabilities.expression],
                                ].map(([key, val]) => (
                                  <div key={key as string}>
                                    <div className="flex justify-between text-[10px] font-bold mb-1">
                                      <span className="capitalize">{key}</span>
                                      <span>{val as number}/5</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-500"
                                        style={{
                                          width: `${((val as number) / 5) * 100}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-black text-[#1E1B4B] uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">
                                Development Summary
                              </h4>
                              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {learner.reportSummary ||
                                  "No detailed summary generated yet. Continue working with Nnora to build a comprehensive profile for your child."}
                              </div>
                            </div>

                            <div className="pt-6">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  createNewThread(
                                    learner.id,
                                    "I need some specific advice regarding the information inside the progress report.",
                                  );
                                }}
                                className="w-full py-4 text-center border-2 border-dashed border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                              >
                                <MessageSquare size={16} /> Discuss this report
                                with Nnora
                              </button>
                            </div>
                          </div>

                          <div className="mt-12 pt-6 border-t border-slate-100 text-center">
                            <p className="text-[10px] text-gray-500 font-medium italic">
                              This report is synthesized by Nnora based on your
                              feedback and shared experiences.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (mode === "FULL_PAGE")
    return (
      <div className={containerClasses}>
        {sidebar}
        {mainContent}
      </div>
    );

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto`}
    >
      {showNudgeBubble && proactiveNudge && (
        <div className="mb-4 mr-2 bg-white rounded-2xl p-4 shadow-2xl border border-brand-100 max-w-[280px] animate-fade-in-up relative">
          <button
            onClick={() => setShowNudgeBubble(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-600"
          >
            <X size={14} />
          </button>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 shrink-0">
              <KnoraAvatar />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">
                Nnora Nudge
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {proactiveNudge}
              </p>
              <button
                onClick={() => {
                  setIsOpen(true);
                  setShowNudgeBubble(false);
                  if (!activeThreadId)
                    createNewThread(undefined, proactiveNudge);
                }}
                className="mt-2 text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
              >
                Let's talk <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={containerClasses}>{mainContent}</div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-20 h-20 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 pointer-events-auto border-4 border-white ring-4 ring-[#1E1B4B] hover:ring-brand-500 ${isOpen ? "bg-[#1E1B4B] rotate-90 scale-90" : "bg-white hover:scale-110 hover:-translate-y-1"}`}
      >
        {isOpen ? (
          <X className="text-white" size={32} />
        ) : (
          <div className="w-full h-full p-1">
            <KnoraAvatar />
          </div>
        )}
      </button>
    </div>
  );
};
