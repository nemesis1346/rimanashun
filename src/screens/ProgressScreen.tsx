import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { loadVocabularyData, getCategoryStats } from "../utils/dataLoader";
import { colors } from "../constants/colors";

export default function ProgressScreen() {
  const [totalWords, setTotalWords] = useState(0);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock progress data (in a real app, this would come from AsyncStorage or a backend)
  const [progress] = useState({
    totalWords: 2985,
    learnedWords: 245,
    currentStreak: 7,
    longestStreak: 12,
    categoriesCompleted: ["numbers", "colors"],
    lastStudyDate: new Date().toISOString(),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const words = await loadVocabularyData();
      const stats = getCategoryStats(words);
      setTotalWords(words.length);
      setCategoryStats(stats);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = () => {
    return Math.round((progress.learnedWords / progress.totalWords) * 100);
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 10) return "🔥";
    if (streak >= 5) return "⚡";
    if (streak >= 3) return "💪";
    return "📈";
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.statGradient}
      >
        <View style={styles.statHeader}>
          <Ionicons name={icon as any} size={24} color="white" />
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>
            Track your Kichwa learning journey
          </Text>
        </View>

        {/* Main Stats */}
        <View style={styles.mainStatsContainer}>
          <StatCard
            title="Words Learned"
            value={`${progress.learnedWords}/${progress.totalWords}`}
            subtitle={`${getProgressPercentage()}% complete`}
            icon="book"
            color={colors.primary}
          />

          <StatCard
            title="Current Streak"
            value={`${progress.currentStreak} days ${getStreakEmoji(
              progress.currentStreak
            )}`}
            subtitle="Keep it up!"
            icon="flame"
            color={colors.secondary}
          />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Overall Progress</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${getProgressPercentage()}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {getProgressPercentage()}% complete
            </Text>
          </View>
        </View>

        {/* Category Progress */}
        <View style={styles.categoryProgressSection}>
          <Text style={styles.sectionTitle}>Category Progress</Text>
          {categoryStats.map((category) => {
            const isCompleted = progress.categoriesCompleted.includes(
              category.id
            );
            const progressPercentage = isCompleted ? 100 : Math.random() * 30; // Mock data

            return (
              <View key={category.id} style={styles.categoryProgressItem}>
                <View style={styles.categoryProgressHeader}>
                  <View style={styles.categoryInfo}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Ionicons
                        name={category.icon as any}
                        size={20}
                        color="white"
                      />
                    </View>
                    <View style={styles.categoryDetails}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryWordCount}>
                        {category.wordCount} words
                      </Text>
                    </View>
                  </View>
                  <View style={styles.categoryProgress}>
                    <Text style={styles.categoryProgressText}>
                      {Math.round(progressPercentage)}%
                    </Text>
                    {isCompleted && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </View>
                </View>
                <View style={styles.categoryProgressBar}>
                  <View
                    style={[
                      styles.categoryProgressFill,
                      {
                        width: `${progressPercentage}%`,
                        backgroundColor: isCompleted
                          ? colors.primary
                          : colors.secondary,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            <View style={styles.achievementItem}>
              <View
                style={[styles.achievementIcon, { backgroundColor: "#FFD700" }]}
              >
                <Ionicons name="trophy" size={24} color="white" />
              </View>
              <Text style={styles.achievementTitle}>First Steps</Text>
              <Text style={styles.achievementDesc}>
                Learn your first 10 words
              </Text>
            </View>

            <View style={styles.achievementItem}>
              <View
                style={[styles.achievementIcon, { backgroundColor: "#4CAF50" }]}
              >
                <Ionicons name="flame" size={24} color="white" />
              </View>
              <Text style={styles.achievementTitle}>Streak Master</Text>
              <Text style={styles.achievementDesc}>
                Maintain a 7-day streak
              </Text>
            </View>

            <View style={styles.achievementItem}>
              <View
                style={[styles.achievementIcon, { backgroundColor: "#FF6B6B" }]}
              >
                <Ionicons name="color-palette" size={24} color="white" />
              </View>
              <Text style={styles.achievementTitle}>Color Expert</Text>
              <Text style={styles.achievementDesc}>
                Complete the Colors category
              </Text>
            </View>

            <View style={styles.achievementItem}>
              <View
                style={[styles.achievementIcon, { backgroundColor: "#45B7D1" }]}
              >
                <Ionicons name="calculator" size={24} color="white" />
              </View>
              <Text style={styles.achievementTitle}>Number Cruncher</Text>
              <Text style={styles.achievementDesc}>
                Complete the Numbers category
              </Text>
            </View>
          </View>
        </View>

        {/* Study Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Study Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="time" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Study for 10-15 minutes daily for best results
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="refresh" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Review difficult words more frequently
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="trending-up" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>Focus on one category at a time</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  mainStatsContainer: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statGradient: {
    padding: 16,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: "white",
    opacity: 0.8,
  },
  progressSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  progressBarContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBar: {
    height: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  progressText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    fontWeight: "bold",
  },
  categoryProgressSection: {
    padding: 20,
    paddingTop: 0,
  },
  categoryProgressItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  categoryWordCount: {
    fontSize: 14,
    color: "#666",
  },
  categoryProgress: {
    alignItems: "flex-end",
  },
  categoryProgressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  categoryProgressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  categoryProgressFill: {
    height: "100%",
  },
  achievementsSection: {
    padding: 20,
    paddingTop: 0,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  achievementItem: {
    width: "48%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  tipsSection: {
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
