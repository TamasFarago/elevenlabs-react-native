import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ConversationStatus, useConversation } from "@elevenlabs/react-native";

import {
  IntakeFormField,
  IntakeFormValues,
  useIntakeForm,
} from "@/src/context/IntakeFormContext";
import env, {
  getAgentId,
  getDemoUserId,
  getTokenFetchUrl,
  isVoiceAgentConfigured,
} from "@/src/utils/env";

type VoiceAgentLog = {
  id: string;
  source: "user" | "agent" | "system" | "tool";
  text: string;
  timestamp: string;
};

type StartAgentOptions = {
  agentId?: string;
  tokenFetchUrl?: string;
  userId?: string;
};

type VoiceAgentContextValue = {
  status: ConversationStatus;
  isSpeaking: boolean;
  canSendFeedback: boolean;
  conversationId?: string;
  logs: VoiceAgentLog[];
  lastError?: string;
  agentId?: string;
  currentRoute: string;
  isMicMuted: boolean;
  startAgent: (options?: StartAgentOptions) => Promise<void>;
  stopAgent: () => Promise<void>;
  sendUserMessage: (text: string) => void;
  sendFeedback: (positive: boolean) => void;
  toggleMic: (muted?: boolean) => void;
};

type VoiceAgentProviderProps = PropsWithChildren<{
  currentRoute: string;
  onNavigate: (path: string) => void;
  agentId?: string;
  userId?: string;
}>;

type ClientToolPayload = Record<string, unknown>;

const VoiceAgentContext = createContext<VoiceAgentContextValue | undefined>(
  undefined
);

const SCREEN_ROUTES: Record<string, string> = {
  home: "/",
  services: "/(tabs)/services",
  intake: "/(tabs)/intake",
};

const MAX_LOG_ITEMS = 40;

const toClientPayload = (parameters: unknown): ClientToolPayload => {
  if (!parameters) {
    return {};
  }

  if (typeof parameters === "string") {
    try {
      return JSON.parse(parameters);
    } catch {
      return {};
    }
  }

  if (typeof parameters === "object") {
    return parameters as ClientToolPayload;
  }

  return {};
};

const isIntakeField = (candidate: unknown): candidate is IntakeFormField => {
  if (typeof candidate !== "string") {
    return false;
  }

  return [
    "name",
    "email",
    "company",
    "phone",
    "service",
    "budget",
    "notes",
  ].includes(candidate);
};

const makeLogId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const describeRoute = (route: string) => {
  switch (route) {
    case "services":
      return "services";
    case "intake":
      return "intake form";
    default:
      return "home";
  }
};

export const VoiceAgentProvider = ({
  children,
  currentRoute,
  onNavigate,
  agentId: agentIdProp,
  userId,
}: VoiceAgentProviderProps) => {
  const { bulkUpdate, resetForm, submitForm, values } = useIntakeForm();
  const [status, setStatus] = useState<ConversationStatus>("disconnected");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [logs, setLogs] = useState<VoiceAgentLog[]>([]);
  const [lastError, setLastError] = useState<string>();
  const [canSendFeedback, setCanSendFeedback] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const resolvedAgentId = getAgentId(agentIdProp);
  const resolvedUserId = getDemoUserId(userId);

  const appendLog = useCallback(
    (entry: Omit<VoiceAgentLog, "id" | "timestamp">) => {
      setLogs((prev) => {
        const next: VoiceAgentLog = {
          id: makeLogId(),
          timestamp: new Date().toISOString(),
          ...entry,
        };

        return [next, ...prev].slice(0, MAX_LOG_ITEMS);
      });
    },
    []
  );

  const registerNavigation = useCallback(
    (target: string) => {
      const normalized = target?.toLowerCase();
      const path = SCREEN_ROUTES[normalized];

      if (!path) {
        throw new Error(
          `Unsupported screen "${target}". Valid options are ${Object.keys(
            SCREEN_ROUTES
          ).join(", ")}.`
        );
      }

      onNavigate(path);
      appendLog({
        source: "tool",
        text: `Voice agent requested navigation to ${normalized} screen.`,
      });

      return `Navigated to ${normalized}.`;
    },
    [appendLog, onNavigate]
  );

  const registerFormUpdate = useCallback(
    (payload: ClientToolPayload) => {
      const updates: Partial<IntakeFormValues> = {};

      const captureFields = (candidate?: ClientToolPayload) => {
        if (!candidate || typeof candidate !== "object") {
          return;
        }

        Object.entries(candidate).forEach(([field, value]) => {
          if (isIntakeField(field) && typeof value !== "undefined") {
            updates[field] = String(value);
          }
        });
      };

      if (payload.field && payload.value && isIntakeField(payload.field)) {
        updates[payload.field] = String(payload.value);
      }

      captureFields(payload.values as ClientToolPayload | undefined);
      captureFields(payload);

      if (!Object.keys(updates).length) {
        throw new Error(
          "fill_intake_form client tool was invoked without valid fields."
        );
      }

      bulkUpdate(updates);
      appendLog({
        source: "tool",
        text: `Updated intake fields via agent: ${Object.keys(updates).join(
          ", "
        )}.`,
      });

      return `Updated fields: ${Object.keys(updates).join(", ")}.`;
    },
    [appendLog, bulkUpdate]
  );

  const clientTools = useMemo(
    () => ({
      navigate_screen: async (parameters: unknown) => {
        const payload = toClientPayload(parameters);
        const target =
          (typeof payload.screen === "string" && payload.screen) ||
          (typeof payload.route === "string" && payload.route);

        if (!target) {
          throw new Error('navigate_screen requires a "screen" parameter.');
        }

        return registerNavigation(target);
      },
      fill_intake_form: async (parameters: unknown) => {
        const payload = toClientPayload(parameters);
        return registerFormUpdate(payload);
      },
      submit_intake_form: () => {
        const result = submitForm({ source: "voice-agent" });
        appendLog({
          source: "tool",
          text: "Voice agent submitted the intake form.",
        });
        return `Submitted intake form at ${result.submittedAt}.`;
      },
      read_intake_form: () => JSON.stringify(values),
      reset_intake_form: () => {
        resetForm();
        appendLog({
          source: "tool",
          text: "Voice agent reset the intake form to defaults.",
        });
        return "Reset intake form.";
      },
    }),
    [
      appendLog,
      registerFormUpdate,
      registerNavigation,
      resetForm,
      submitForm,
      values,
    ]
  );

  const conversation = useConversation({
    clientTools,
    onConnect: ({ conversationId }) => {
      setConversationId(conversationId);
      appendLog({
        source: "system",
        text: `Connected to conversation ${conversationId}.`,
      });
    },
    onDisconnect: () => {
      setConversationId(undefined);
      setCanSendFeedback(false);
      appendLog({
        source: "system",
        text: "Conversation ended.",
      });
    },
    onStatusChange: ({ status }) => setStatus(status),
    onMessage: ({ message, source }) => {
      appendLog({
        source: source === "ai" ? "agent" : "user",
        text: message,
      });
    },
    onModeChange: ({ mode }) => setIsSpeaking(mode === "speaking"),
    onError: (message) => {
      setLastError(message);
      appendLog({
        source: "system",
        text: `Error: ${message}`,
      });
    },
    onCanSendFeedbackChange: ({ canSendFeedback }) =>
      setCanSendFeedback(canSendFeedback),
    onUnhandledClientToolCall: (tool) => {
      appendLog({
        source: "system",
        text: `Unhandled client tool: ${tool.tool_name}`,
      });
    },
  });

  useEffect(() => {
    if (status === "connected") {
      conversation.sendContextualUpdate(
        `User is viewing the ${describeRoute(currentRoute)} screen.`
      );
    }
  }, [conversation, currentRoute, status]);

  const startAgent = useCallback(
    async (options?: StartAgentOptions) => {
      const targetAgentId = getAgentId(options?.agentId || resolvedAgentId);

      if (!targetAgentId) {
        const message =
          "Missing agent ID. Set EXPO_PUBLIC_ELEVENLABS_AGENT_ID or pass an agentId override.";
        setLastError(message);
        appendLog({ source: "system", text: message });
        throw new Error(message);
      }

      setLastError(undefined);
      appendLog({
        source: "system",
        text: "Attempting to connect to ElevenLabs agent…",
      });

      await conversation.startSession({
        agentId: env.agentId,
        // tokenFetchUrl: getTokenFetchUrl(options?.tokenFetchUrl),
        // userId: getDemoUserId(options?.userId || resolvedUserId),
      });

      setIsMicMuted(false);
    },
    [appendLog, conversation, resolvedAgentId, resolvedUserId]
  );

  const stopAgent = useCallback(async () => {
    await conversation.endSession("user");
    setIsMicMuted(false);
  }, [conversation]);

  const sendUserMessage = useCallback(
    (text: string) => {
      if (!text.trim()) {
        return;
      }

      conversation.sendUserMessage(text);
      appendLog({
        source: "user",
        text,
      });
    },
    [appendLog, conversation]
  );

  const sendFeedback = useCallback(
    (positive: boolean) => {
      if (!canSendFeedback) {
        return;
      }

      conversation.sendFeedback(positive);
      appendLog({
        source: "system",
        text: `Sent ${positive ? "positive" : "negative"} feedback.`,
      });
      setCanSendFeedback(false);
    },
    [appendLog, canSendFeedback, conversation]
  );

  const toggleMic = useCallback(
    (explicit?: boolean) => {
      const next = typeof explicit === "boolean" ? explicit : !isMicMuted;
      setIsMicMuted(next);
      conversation.setMicMuted(next);
    },
    [conversation, isMicMuted]
  );

  useEffect(() => {
    conversation.setMicMuted(false);
  }, []);

  const value = useMemo<VoiceAgentContextValue>(
    () => ({
      status,
      isSpeaking,
      canSendFeedback,
      conversationId,
      logs,
      lastError,
      agentId: resolvedAgentId,
      currentRoute,
      isMicMuted,
      startAgent,
      stopAgent,
      sendUserMessage,
      sendFeedback,
      toggleMic,
    }),
    [
      canSendFeedback,
      conversationId,
      currentRoute,
      isMicMuted,
      isSpeaking,
      lastError,
      logs,
      resolvedAgentId,
      sendFeedback,
      sendUserMessage,
      startAgent,
      status,
      stopAgent,
      toggleMic,
    ]
  );

  useEffect(() => {
    if (!isVoiceAgentConfigured()) {
      appendLog({
        source: "system",
        text: "Set EXPO_PUBLIC_ELEVENLABS_AGENT_ID to enable voice agent connectivity.",
      });
    }
  }, [appendLog]);

  return (
    <VoiceAgentContext.Provider value={value}>
      {children}
    </VoiceAgentContext.Provider>
  );
};

export const useVoiceAgentContext = () => {
  const context = useContext(VoiceAgentContext);
  if (!context) {
    throw new Error(
      "useVoiceAgentContext must be used within VoiceAgentProvider"
    );
  }

  return context;
};
