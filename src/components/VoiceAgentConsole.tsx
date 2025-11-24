import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useVoiceAgent } from "@/src/hooks/useVoiceAgent";

const STATUS_COLORS = {
  disconnected: "#94a3b8",
  connecting: "#f97316",
  connected: "#22c55e",
};

export const VoiceAgentConsole = () => {
  const {
    status,
    isSpeaking,
    startAgent,
    stopAgent,
    logs,
    canSendFeedback,
    sendFeedback,
    lastError,
    conversationId,
    agentId,
    isMicMuted,
    toggleMic,
  } = useVoiceAgent();
  const [busy, setBusy] = useState(false);

  const latestLogs = useMemo(() => logs.slice(0, 4), [logs]);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting…";
      default:
        return "Disconnected";
    }
  }, [status]);

  const handleSessionToggle = async () => {
    if (busy || !agentId) {
      return;
    }

    setBusy(true);
    try {
      if (status === "connected" || status === "connecting") {
        await stopAgent();
      } else {
        await startAgent();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                STATUS_COLORS[status] ?? STATUS_COLORS.disconnected,
            },
          ]}
        />
        <Text style={styles.statusText}>{statusLabel}</Text>
        {isSpeaking && <Text style={styles.speakingPill}>Speaking</Text>}
      </View>

      <Text style={styles.metaText}>
        Agent:{" "}
        <Text style={styles.metaValue}>
          {agentId ?? "Set EXPO_PUBLIC_ELEVENLABS_AGENT_ID"}
        </Text>
      </Text>
      {conversationId && (
        <Text style={styles.metaText}>
          Conversation:{" "}
          <Text style={styles.metaValue}>
            #{conversationId.slice(-6).toUpperCase()}
          </Text>
        </Text>
      )}
    

      <View style={styles.actionsRow}>
        <Pressable
          accessible
          accessibilityRole="button"
          disabled={busy || !agentId}
          onPress={handleSessionToggle}
          style={({ pressed }) => [
            styles.primaryButton,
            status === "connected" && styles.dangerButton,
            pressed && styles.buttonPressed,
            (!agentId || busy) && styles.buttonDisabled,
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {status === "connected" ? "Hang Up" : "Connect"}
            </Text>
          )}
        </Pressable>

        <Pressable
          accessible
          accessibilityRole="button"
          onPress={() => toggleMic()}
          disabled={status === "disconnected"}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.buttonPressed,
            status === "disconnected" && styles.buttonDisabled,
          ]}
        >
          <Ionicons
            name={isMicMuted ? "mic-off" : "mic"}
            size={18}
            color={status === "disconnected" ? "#94a3b8" : "#0f172a"}
          />
          <Text style={styles.iconButtonText}>
            {isMicMuted ? "Unmute" : "Mute"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.feedbackRow}>
        <Pressable
          disabled={!canSendFeedback}
          onPress={() => sendFeedback(true)}
          style={({ pressed }) => [
            styles.feedbackButton,
            pressed && styles.buttonPressed,
            !canSendFeedback && styles.buttonDisabled,
          ]}
        >
          <Ionicons name="thumbs-up" size={16} color="#0f172a" />
          <Text style={styles.feedbackText}>Positive</Text>
        </Pressable>
        <Pressable
          disabled={!canSendFeedback}
          onPress={() => sendFeedback(false)}
          style={({ pressed }) => [
            styles.feedbackButton,
            pressed && styles.buttonPressed,
            !canSendFeedback && styles.buttonDisabled,
          ]}
        >
          <Ionicons name="thumbs-down" size={16} color="#0f172a" />
          <Text style={styles.feedbackText}>Negative</Text>
        </Pressable>
      </View>

      <View style={styles.logContainer}>
        <Text style={styles.logHeading}>Recent activity</Text>
        {latestLogs.length === 0 ? (
          <Text style={styles.emptyState}>
            No voice traffic yet. Start the session to see transcripts.
          </Text>
        ) : (
          latestLogs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <Text style={styles.logSource}>{log.source.toUpperCase()}</Text>
              <Text style={styles.logMessage}>{log.text}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    gap: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  speakingPill: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#dcfce7",
    color: "#166534",
    fontSize: 12,
    fontWeight: "600",
  },
  metaText: {
    color: "#64748b",
    fontSize: 13,
  },
  metaValue: {
    color: "#0f172a",
    fontWeight: "600",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButton: {
    backgroundColor: "#dc2626",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  iconButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconButtonText: {
    color: "#0f172a",
    fontWeight: "600",
  },
  feedbackRow: {
    flexDirection: "row",
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#fde68a",
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    alignItems: "center",
  },
  feedbackText: {
    color: "#78350f",
    fontWeight: "600",
  },
  logContainer: {
    gap: 8,
    marginTop: 8,
  },
  logHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  emptyState: {
    color: "#94a3b8",
    fontSize: 13,
  },
  logItem: {
    borderRadius: 10,
    backgroundColor: "#fff",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  logSource: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "700",
  },
  logMessage: {
    color: "#0f172a",
    fontSize: 13,
  },
});
