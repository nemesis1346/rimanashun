import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../kichwa-learning-app/App";
import {
  loadVocabularyData,
  getWordsByCategory,
  generateQuizQuestions,
} from "../utils/dataLoader";
import { QuizQuestion } from "../types";

type QuizRouteProp = RouteProp<RootStackParamList, "Quiz">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function QuizScreen() {
  const route = useRoute<QuizRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { category } = route.params || {};

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const fadeAnimation = new Animated.Value(1);
  const scaleAnimation = new Animated.Value(1);

  useEffect(() => {
    loadQuiz();
  }, [category]);

  const loadQuiz = async () => {
    try {
      const allWords = await loadVocabularyData();
      const filteredWords = category
        ? getWordsByCategory(allWords, category)
        : allWords;
      const quizQuestions = generateQuizQuestions(filteredWords, 10);
      setQuestions(quizQuestions);
    } catch (error) {
      console.error("Error loading quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
    }

    // Animate feedback
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Wait 1.5 seconds then move to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        nextQuestion();
      } else {
        finishQuiz();
      }
    }, 1500);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);

    // Fade animation for question transition
    Animated.sequence([
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const finishQuiz = () => {
    setShowResults(true);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowResults(false);
    fadeAnimation.setValue(1);
    scaleAnimation.setValue(1);
  };

  const getAnswerStyle = (answer: string) => {
    if (!isAnswered) return styles.answerOption;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    const isSelected = answer === selectedAnswer;

    if (isCorrect) {
      return [styles.answerOption, styles.correctAnswer];
    } else if (isSelected && !isCorrect) {
      return [styles.answerOption, styles.incorrectAnswer];
    }

    return styles.answerOption;
  };

  const getAnswerIcon = (answer: string) => {
    if (!isAnswered) return null;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    const isSelected = answer === selectedAnswer;

    if (isCorrect) {
      return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
    } else if (isSelected && !isCorrect) {
      return <Ionicons name="close-circle" size={24} color="#FF6B6B" />;
    }

    return null;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    const isGoodScore = percentage >= 70;

    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={isGoodScore ? ["#4CAF50", "#45B7D1"] : ["#FF6B6B", "#FF8E8E"]}
          style={styles.resultsContainer}
        >
          <View style={styles.resultsContent}>
            <Ionicons
              name={isGoodScore ? "trophy" : "sad"}
              size={80}
              color="white"
            />
            <Text style={styles.resultsTitle}>
              {isGoodScore ? "¡Excellent!" : "Keep practicing!"}
            </Text>
            <Text style={styles.resultsScore}>
              {score}/{questions.length} ({percentage}%)
            </Text>
            <Text style={styles.resultsMessage}>
              {isGoodScore
                ? "Great job! You're making excellent progress."
                : "Don't worry, practice makes perfect!"}
            </Text>

            <View style={styles.resultsButtons}>
              <TouchableOpacity
                style={styles.restartButton}
                onPress={restartQuiz}
              >
                <Text style={styles.restartButtonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.homeButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.homeButtonText}>Go Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={64} color="#666" />
          <Text style={styles.emptyText}>
            No questions available for this category
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {category ? `${category} Quiz` : "General Quiz"}
        </Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} of {questions.length}
        </Text>
      </View>

      {/* Question */}
      <Animated.View
        style={[styles.questionContainer, { opacity: fadeAnimation }]}
      >
        <Text style={styles.questionType}>
          {currentQuestion.type === "kichwa-to-spanish"
            ? "Kichwa → Spanish"
            : "Spanish → Kichwa"}
        </Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </Animated.View>

      {/* Answer Options */}
      <View style={styles.answersContainer}>
        {currentQuestion.options.map((answer, index) => (
          <Animated.View
            key={index}
            style={[
              getAnswerStyle(answer),
              { transform: [{ scale: scaleAnimation }] },
            ]}
          >
            <TouchableOpacity
              style={styles.answerTouchable}
              onPress={() => handleAnswerSelect(answer)}
              disabled={isAnswered}
            >
              <View style={styles.answerContent}>
                <Text style={styles.answerText}>{answer}</Text>
                {getAnswerIcon(answer)}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Feedback */}
      {isAnswered && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            {selectedAnswer === currentQuestion.correctAnswer
              ? "Correct! 🎉"
              : `Incorrect. The answer is: ${currentQuestion.correctAnswer}`}
          </Text>
        </View>
      )}
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
  scoreContainer: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scoreText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
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
  },
  questionContainer: {
    padding: 20,
    alignItems: "center",
  },
  questionType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  questionText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    lineHeight: 36,
  },
  answersContainer: {
    padding: 20,
    flex: 1,
  },
  answerOption: {
    backgroundColor: "white",
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
  answerTouchable: {
    padding: 20,
  },
  answerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  answerText: {
    fontSize: 18,
    color: "#333",
    flex: 1,
  },
  correctAnswer: {
    backgroundColor: "#E8F5E8",
    borderColor: "#4CAF50",
    borderWidth: 2,
  },
  incorrectAnswer: {
    backgroundColor: "#FFEBEE",
    borderColor: "#FF6B6B",
    borderWidth: 2,
  },
  feedbackContainer: {
    padding: 20,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  resultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsContent: {
    alignItems: "center",
    padding: 40,
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
    marginBottom: 10,
  },
  resultsScore: {
    fontSize: 24,
    color: "white",
    marginBottom: 20,
  },
  resultsMessage: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 40,
    opacity: 0.9,
  },
  resultsButtons: {
    flexDirection: "row",
    gap: 20,
  },
  restartButton: {
    backgroundColor: "white",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  homeButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "white",
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
