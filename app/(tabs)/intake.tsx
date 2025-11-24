import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { IntakeForm } from "@/src/components/IntakeForm";
import { useVoiceAgent } from "@/src/hooks/useVoiceAgent";
import { SafeAreaView } from "react-native-safe-area-context";

const TOOLING = [
  {
    name: "navigate_screen",
    purpose: "Jump between overview, services, or intake tabs.",
  },
  {
    name: "fill_intake_form",
    purpose: "Capture driver details, desired mileage, and vehicles.",
  },
  {
    name: "submit_intake_form",
    purpose: "Create a lead handoff with the same submit action below.",
  },
  {
    name: "reset_intake_form",
    purpose: "Clear responses when the shopper changes direction.",
  },
];

export default function IntakeScreen() {
  const { status } = useVoiceAgent();

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Driver & vehicle intake</Text>
        <Text style={styles.subtitle}>
          Keep this screen open during a call and let the leasing concierge
          populate the profile while the shopper speaks naturally.
        </Text>

        <View style={styles.voiceCard}>
          <Text style={styles.voiceCardTitle}>Agent-aware tooling</Text>
        </View>

        <IntakeForm />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 15,
    color: "#475569",
  },
  voiceCard: {
    borderWidth: 1,
    borderColor: "#cbd5f5",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    backgroundColor: "#f8fafc",
  },
  voiceCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  voiceCardSubtitle: {
    color: "#475569",
    fontSize: 13,
  },
  statusValue: {
    fontWeight: "700",
    color: "#0f172a",
    textTransform: "capitalize",
  },
  toolList: {
    gap: 8,
  },
  toolRow: {
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 4,
  },
  toolName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  toolDescription: {
    color: "#475569",
    fontSize: 13,
  },
});
