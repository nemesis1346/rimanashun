import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  RootStackParamList,
  TabParamList,
} from "../../kichwa-learning-app/App";
import { loadVocabularyData } from "../utils/dataLoader";
import { KichwaWord } from "../types";
import { colors } from "../constants/colors";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [totalWords, setTotalWords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const words = await loadVocabularyData();
      setTotalWords(words.length);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const QuickActionButton = ({
    title,
    subtitle,
    icon,
    color,
    onPress,
  }: {
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <LinearGradient
        colors={[color, color + "80"]}
        style={styles.quickActionGradient}
      >
        <Ionicons name={icon as any} size={32} color="white" />
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Kichwa vocabulary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <LinearGradient colors={colors.primaryGradient} style={styles.header}>
          <Text style={styles.welcomeText}>¡Alli puncha!</Text>
          <Text style={styles.subtitleText}>Welcome to Kichwa Learning</Text>
          <Text style={styles.statsText}>{totalWords} words available</Text>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Start</Text>

          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              title="Flashcards"
              subtitle="Learn with cards"
              icon="card"
              color={colors.primary}
              onPress={() => navigation.navigate("Flashcard", {})}
            />

            <QuickActionButton
              title="Quiz"
              subtitle="Test your knowledge"
              icon="help-circle"
              color={colors.secondary}
              onPress={() => navigation.navigate("Quiz", {})}
            />

            <QuickActionButton
              title="Categories"
              subtitle="Browse by topic"
              icon="grid"
              color={colors.accent}
              onPress={() => navigation.navigate("Categories")}
            />

            <QuickActionButton
              title="Progress"
              subtitle="Track your learning"
              icon="stats-chart"
              color={colors.primary}
              onPress={() => navigation.navigate("Progress")}
            />
          </View>
        </View>

        {/* Daily Challenge */}
        <View style={styles.dailyChallengeContainer}>
          <Text style={styles.sectionTitle}>Daily Challenge</Text>
          <TouchableOpacity
            style={styles.dailyChallengeButton}
            onPress={() => navigation.navigate("Quiz", {})}
          >
            <LinearGradient
              colors={colors.accentGradient}
              style={styles.dailyChallengeGradient}
            >
              <Ionicons name="trophy" size={24} color="white" />
              <Text style={styles.dailyChallengeText}>
                Complete today's quiz to maintain your streak!
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Learning Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="bulb" size={20} color={colors.primary} />
            <Text style={styles.tipText}>
              Practice flashcards daily to reinforce your memory
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={styles.tipText}>
              Take short 5-minute sessions for better retention
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="repeat" size={20} color={colors.primary} />
            <Text style={styles.tipText}>
              Review difficult words more frequently
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 18,
    color: "white",
    opacity: 0.9,
    marginBottom: 8,
  },
  statsText: {
    fontSize: 16,
    color: "white",
    opacity: 0.8,
  },
  quickActionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionButton: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  quickActionGradient: {
    padding: 20,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginTop: 8,
    textAlign: "center",
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
    marginTop: 4,
    textAlign: "center",
  },
  dailyChallengeContainer: {
    padding: 20,
    paddingTop: 0,
  },
  dailyChallengeButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  dailyChallengeGradient: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  dailyChallengeText: {
    fontSize: 16,
    color: "white",
    marginLeft: 12,
    flex: 1,
  },
  tipsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
  },
  tipText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
});
