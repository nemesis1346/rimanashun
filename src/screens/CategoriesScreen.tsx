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
import { categories } from "../data/categories";
import { loadVocabularyData, getCategoryStats } from "../utils/dataLoader";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function CategoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategoryStats();
  }, []);

  const loadCategoryStats = async () => {
    try {
      const words = await loadVocabularyData();
      const stats = getCategoryStats(words);
      setCategoryStats(stats);
    } catch (error) {
      console.error("Error loading category stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    // Navigate to flashcards with category filter
    navigation.navigate("Flashcard", { category: categoryId });
  };

  const handleCategoryQuiz = (categoryId: string) => {
    // Navigate to quiz with category filter
    navigation.navigate("Quiz", { category: categoryId });
  };

  const CategoryCard = ({
    category,
    wordCount,
  }: {
    category: any;
    wordCount: number;
  }) => (
    <View style={styles.categoryCard}>
      <LinearGradient
        colors={[category.color, category.color + "80"]}
        style={styles.categoryGradient}
      >
        <View style={styles.categoryHeader}>
          <Ionicons name={category.icon as any} size={32} color="white" />
          <Text style={styles.categoryName}>{category.name}</Text>
        </View>

        <Text style={styles.categoryDescription}>{category.description}</Text>

        <View style={styles.categoryStats}>
          <Text style={styles.wordCount}>{wordCount} words</Text>
        </View>

        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Ionicons name="card" size={20} color="white" />
            <Text style={styles.actionButtonText}>Flashcards</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCategoryQuiz(category.id)}
          >
            <Ionicons name="help-circle" size={20} color="white" />
            <Text style={styles.actionButtonText}>Quiz</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        <Text style={styles.headerSubtitle}>
          Choose a topic to start learning
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoriesContainer}>
          {categoryStats.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              wordCount={category.wordCount}
            />
          ))}
        </View>

        {/* All Words Option */}
        <View style={styles.allWordsContainer}>
          <TouchableOpacity
            style={styles.allWordsCard}
            onPress={() => navigation.navigate("Flashcard", {})}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.allWordsGradient}
            >
              <View style={styles.allWordsContent}>
                <Ionicons name="library" size={40} color="white" />
                <Text style={styles.allWordsTitle}>All Words</Text>
                <Text style={styles.allWordsDescription}>
                  Practice with all available vocabulary
                </Text>
                <Text style={styles.allWordsCount}>
                  {categoryStats.reduce(
                    (total, cat) => total + cat.wordCount,
                    0
                  )}{" "}
                  total words
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Learning Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Learning Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="bulb" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Start with basic categories like Numbers and Colors
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="trending-up" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Progress through categories to build vocabulary systematically
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="refresh" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Review completed categories regularly to reinforce learning
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
    backgroundColor: "#f5f5f5",
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
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  categoryCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryGradient: {
    padding: 20,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginLeft: 12,
  },
  categoryDescription: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
    marginBottom: 16,
  },
  categoryStats: {
    marginBottom: 16,
  },
  wordCount: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  categoryActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  allWordsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  allWordsCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  allWordsGradient: {
    padding: 30,
    alignItems: "center",
  },
  allWordsContent: {
    alignItems: "center",
  },
  allWordsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginTop: 12,
    marginBottom: 8,
  },
  allWordsDescription: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 12,
  },
  allWordsCount: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  tipsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
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
