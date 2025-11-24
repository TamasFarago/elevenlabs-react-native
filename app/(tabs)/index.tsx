import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

import { VoiceAgentConsole } from "@/src/components/VoiceAgentConsole";
import { useVoiceAgent } from "@/src/hooks/useVoiceAgent";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const PROMPTS = [
  {
    title: "Find the right SUV",
    prompt:
      "Recommend a family SUV lease under $650/month that is available this quarter.",
  },
  {
    title: "Pre-qualify a driver",
    prompt:
      "Collect my contact info, preferred mileage allowance, and submit the intake form.",
  },
  {
    title: "Fleet rollout briefing",
    prompt:
      "Explain how this agent can support a multi-branch leasing desk with after-hours coverage.",
  },
];

export default function HomeScreen() {
  const { sendUserMessage, status } = useVoiceAgent();
  const router = useRouter();

  const handlePrompt = (prompt: string) => {
    sendUserMessage(prompt);
  };

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>AI leasing concierge</Text>
        <Text style={styles.subtitle}>
          This ElevenLabs-powered rep moves across tabs, fills prospect forms,
          and narrates lease options for a car-leasing showroom—hands-free.
        </Text>

        <VoiceAgentConsole />

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick prompts</Text>
          <View style={styles.promptGrid}>
            {PROMPTS.map((item) => (
              <Pressable
                key={item.title}
                disabled={status === "disconnected"}
                style={({ pressed }) => [
                  styles.promptCard,
                  pressed && styles.promptCardPressed,
                  status === "disconnected" && styles.promptCardDisabled,
                ]}
                onPress={() => handlePrompt(item.prompt)}
              >
                <Text style={styles.promptTitle}>{item.title}</Text>
                <Text style={styles.promptText}>{item.prompt}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.ctaCard}>
          <Text style={styles.sectionTitle}>Need more context?</Text>
          <Text style={styles.ctaDescription}>
            Browse the service packages we offer leasing teams or jump into
            intake to see the agent capture a full driver profile in seconds.
          </Text>
          <View style={styles.ctaActions}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push("/(tabs)/services")}
            >
              <Text style={styles.secondaryButtonText}>Browse services</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push("/(tabs)/intake")}
            >
              <Text style={styles.primaryButtonText}>Open intake form</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 16,
    color: "#475569",
  },
  quickActions: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  promptGrid: {
    gap: 12,
  },
  promptCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5f5",
    padding: 16,
    backgroundColor: "#fff",
    gap: 6,
  },
  promptCardPressed: {
    opacity: 0.85,
  },
  promptCardDisabled: {
    backgroundColor: "#e2e8f0",
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  promptText: {
    color: "#475569",
  },
  ctaCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#0f172a",
    gap: 12,
  },
  ctaDescription: {
    color: "#cbd5f5",
    fontSize: 14,
  },
  ctaActions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#94a3b8",
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
