import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

import { useVoiceAgent } from "@/src/hooks/useVoiceAgent";
import { SafeAreaView } from "react-native-safe-area-context";

const SERVICES = [
  {
    title: "Showroom Jumpstart",
    duration: "2 weeks",
    description:
      "Launch an AI concierge that greets walk-ins, captures lead basics, and guides shoppers to the right lease tier.",
    highlights: [
      "In-store greeting scripts",
      "Driver-profile intake flows",
      "CRM-ready payloads",
    ],
  },
  {
    title: "Digital Desk Integration",
    duration: "4 weeks",
    description:
      "Blend the agent into your website or mobile app so prospects can check payment scenarios and inventory 24/7.",
    highlights: [
      "Realtime payment calculators",
      "Inventory + incentives tools",
      "Compliance guardrails",
    ],
  },
  {
    title: "Fleet & Franchise Ops",
    duration: "6 weeks",
    description:
      "Scale the assistant across branches with analytics, escalation paths, and fleet-specific playbooks.",
    highlights: [
      "Branch-level routing",
      "Fleet utilization insights",
      "Manager reporting suite",
    ],
  },
];

export default function ServicesScreen() {
  const { sendUserMessage, status } = useVoiceAgent();

  const handlePrompt = (serviceTitle: string) => {
    sendUserMessage(
      `Tell me more about the ${serviceTitle} package and when it is the best fit.`
    );
  };

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Packages for leasing teams</Text>
        <Text style={styles.subtitle}>
          Each offer is tuned for a car-leasing workflow and can be demoed live
          through the agent. Tap a card to hear the assistant pitch it.
        </Text>

        <View style={styles.cardGrid}>
          {SERVICES.map((service) => (
            <View key={service.title} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{service.title}</Text>
                <Text style={styles.badge}>{service.duration}</Text>
              </View>
              <Text style={styles.cardDescription}>{service.description}</Text>
              <View style={styles.highlightList}>
                {service.highlights.map((highlight) => (
                  <View key={highlight} style={styles.highlightRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
              <Pressable
                disabled={status === "disconnected"}
                onPress={() => handlePrompt(service.title)}
                style={({ pressed }) => [
                  styles.promptButton,
                  pressed && styles.promptButtonPressed,
                  status === "disconnected" && styles.promptButtonDisabled,
                ]}
              >
                <Text style={styles.promptButtonText}>
                  Ask the agent about this
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 16,
  },
  cardGrid: {
    gap: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#cbd5f5",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#fff",
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    fontSize: 12,
    fontWeight: "700",
  },
  cardDescription: {
    color: "#475569",
    fontSize: 14,
  },
  highlightList: {
    gap: 8,
  },
  highlightRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563eb",
  },
  highlightText: {
    color: "#0f172a",
    fontSize: 14,
    flex: 1,
  },
  promptButton: {
    borderRadius: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    alignItems: "center",
  },
  promptButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  promptButtonPressed: {
    opacity: 0.85,
  },
  promptButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
});
