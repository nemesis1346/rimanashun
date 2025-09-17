import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../constants/colors";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { loadVocabularyData, getWordsByCategory } from "../utils/dataLoader";
import { KichwaWord, FlashcardData } from "../types";

type FlashcardRouteProp = RouteProp<RootStackParamList, "Flashcard">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FlashcardScreen() {
  const route = useRoute<FlashcardRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const category = route?.params?.category;

  const [words, setWords] = useState<KichwaWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set());
  const [unknownWords, setUnknownWords] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const flipAnimation = useRef(new Animated.Value(0)).current;
  const swipeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, [category]);

  const loadData = async () => {
    try {
      const allWords = await loadVocabularyData();
      const filteredWords = category
        ? getWordsByCategory(allWords, category)
        : allWords;

      setWords(filteredWords);
    } catch (error) {
      console.error("Error loading data:", error);
      setWords([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnimation, {
      toValue,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleSwipe = (direction: "left" | "right") => {
    const currentWord = words[currentIndex];

    if (direction === "right") {
      // Known
      setKnownWords((prev) => new Set([...prev, currentWord.kichwa]));
    } else {
      // Unknown
      setUnknownWords((prev) => new Set([...prev, currentWord.kichwa]));
    }

    // Animate swipe
    Animated.timing(swipeAnimation, {
      toValue: direction === "right" ? 1 : -1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Move to next card
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        flipAnimation.setValue(0);
        swipeAnimation.setValue(0);
      } else {
        // Finished all cards
        showResults();
      }
    });
  };

  const showResults = () => {
    // Navigate to results or show completion modal
    navigation.goBack();
  };

  const frontInterpolate = useMemo(
    () =>
      flipAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }),
    [flipAnimation]
  );

  const backInterpolate = useMemo(
    () =>
      flipAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ["180deg", "360deg"],
      }),
    [flipAnimation]
  );

  const frontAnimatedStyle = useMemo(
    () => ({
      transform: [{ rotateY: frontInterpolate }],
    }),
    [frontInterpolate]
  );

  const backAnimatedStyle = useMemo(
    () => ({
      transform: [{ rotateY: backInterpolate }],
    }),
    [backInterpolate]
  );

  const swipeStyle = useMemo(
    () => ({
      transform: [
        {
          translateX: swipeAnimation.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-400, 0, 400],
          }),
        },
        {
          rotate: swipeAnimation.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: ["-30deg", "0deg", "30deg"],
          }),
        },
      ],
    }),
    [swipeAnimation]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading flashcards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (words.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={64} color="#666" />
          <Text style={styles.emptyText}>No words found for this category</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  console.log("current word", currentWord);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {category ? `${category} Flashcards` : "All Words"}
        </Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{words.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <TouchableOpacity onPress={flipCard} activeOpacity={0.9}>
          <Animated.View style={[styles.card, swipeStyle]}>
            {!isFlipped ? (
              /* Front of card */
              <View style={[styles.cardSide, styles.cardFront]}>
                <LinearGradient
                  colors={colors.primaryGradient}
                  style={styles.cardGradient}
                >
                  <Text style={styles.cardText}>{currentWord.kichwa}</Text>
                  <Text style={styles.cardHint}>Tap to reveal translation</Text>
                </LinearGradient>
              </View>
            ) : (
              /* Back of card */
              <View style={[styles.cardSide, styles.cardBack]}>
                <LinearGradient
                  colors={colors.accentGradient}
                  style={styles.cardGradient}
                >
                  <Text style={styles.cardText}>{currentWord.spanish}</Text>
                  <Text style={styles.cardHint}>Tap to flip back</Text>
                </LinearGradient>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Swipe Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Swipe left if you don't know, swipe right if you know
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.dontKnowButton]}
          onPress={() => handleSwipe("left")}
        >
          <Ionicons name="close" size={24} color="white" />
          <Text style={styles.actionButtonText}>Don't Know</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.knowButton]}
          onPress={() => handleSwipe("right")}
        >
          <Ionicons name="checkmark" size={24} color="white" />
          <Text style={styles.actionButtonText}>Know</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{knownWords.size}</Text>
          <Text style={styles.statLabel}>Known</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{unknownWords.size}</Text>
          <Text style={styles.statLabel}>Unknown</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {words.length - currentIndex - 1}
          </Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  progressContainer: {
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    color: "#666",
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
  },
  cardSide: {
    width: "100%",
    height: "100%",
  },
  cardFront: {
    backgroundColor: "transparent",
  },
  cardBack: {
    backgroundColor: "transparent",
  },
  cardGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  cardHint: {
    fontSize: 16,
    color: "white",
    opacity: 0.8,
    textAlign: "center",
  },
  instructionsContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: "center",
  },
  dontKnowButton: {
    backgroundColor: colors.accent,
  },
  knowButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
