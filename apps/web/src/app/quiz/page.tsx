"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { colors } from "@/lib/colors";
import { fetchVocabulary, KichwaWord, generateQuizQuestions } from "@/lib/data";

interface QuizQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
  type: "kichwa-to-spanish" | "spanish-to-kichwa";
}

export default function QuizPage() {
  const [words, setWords] = useState<KichwaWord[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await fetchVocabulary();
      setWords(data);
      generateQuiz(data);
      setIsLoading(false);
    })();
  }, []);

  const generateQuiz = (vocabData: KichwaWord[]) => {
    if (vocabData.length === 0) return;
    const quizQuestions = generateQuizQuestions(
      vocabData,
      Math.min(10, vocabData.length)
    );
    setQuestions(quizQuestions);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (answer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    generateQuiz(words);
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: colors.textSecondary }}>Loading quiz...</p>
        </div>
      </Layout>
    );
  }

  if (words.length === 0) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2 style={{ color: colors.textPrimary, marginBottom: "1rem" }}>
            No vocabulary available
          </h2>
          <p style={{ color: colors.textSecondary }}>
            Please add vocabulary data to get started.
          </p>
        </div>
      </Layout>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2 style={{ color: colors.textPrimary, marginBottom: "2rem" }}>
            Quiz Complete! 🎉
          </h2>

          <div
            style={{
              backgroundColor: colors.cardBackground,
              border: `2px solid ${colors.border}`,
              borderRadius: "16px",
              padding: "2rem",
              marginBottom: "2rem",
              maxWidth: "400px",
              margin: "0 auto 2rem auto",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              {percentage >= 80 ? "🏆" : percentage >= 60 ? "👍" : "📚"}
            </div>
            <h3 style={{ color: colors.textPrimary, margin: "0 0 1rem 0" }}>
              Your Score: {score}/{questions.length}
            </h3>
            <p
              style={{
                color: colors.textSecondary,
                margin: 0,
                fontSize: "1.2rem",
              }}
            >
              {percentage}% Correct
            </p>
          </div>

          <button
            onClick={handleRestart}
            style={{
              padding: "1rem 2rem",
              backgroundColor: colors.primary,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1.1rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
          >
            Take Another Quiz
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <h2 style={{ color: colors.textPrimary, marginBottom: "2rem" }}>
          Quiz
        </h2>

        {/* Progress Bar */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ color: colors.textSecondary, fontSize: "0.9rem" }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span style={{ color: colors.textSecondary, fontSize: "0.9rem" }}>
              Score: {score}/{currentQuestionIndex + (isAnswered ? 1 : 0)}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: colors.border,
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${colors.primaryGradient[0]}, ${colors.primaryGradient[1]})`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div
          style={{
            backgroundColor: colors.cardBackground,
            border: `2px solid ${colors.border}`,
            borderRadius: "16px",
            padding: "2rem",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              color: colors.primary,
              fontSize: "2rem",
              margin: "0 0 1rem 0",
              fontWeight: "bold",
            }}
          >
            {currentQuestion?.question}
          </h3>
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            {currentQuestion?.type === "kichwa-to-spanish"
              ? "What does this mean in Spanish?"
              : "What does this mean in Kichwa?"}
          </p>
        </div>

        {/* Answer Options */}
        <div style={{ marginBottom: "2rem" }}>
          {currentQuestion?.options.map((option, index) => {
            let buttonStyle: React.CSSProperties = {
              width: "100%",
              padding: "1rem",
              marginBottom: "0.75rem",
              border: `2px solid ${colors.border}`,
              borderRadius: "12px",
              backgroundColor: colors.cardBackground,
              color: colors.textPrimary,
              cursor: "pointer",
              fontSize: "1.1rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
            };

            if (isAnswered) {
              if (option === currentQuestion.correctAnswer) {
                buttonStyle = {
                  ...buttonStyle,
                  backgroundColor: "#10B981",
                  color: "white",
                  borderColor: "#10B981",
                };
              } else if (
                option === selectedAnswer &&
                option !== currentQuestion.correctAnswer
              ) {
                buttonStyle = {
                  ...buttonStyle,
                  backgroundColor: "#EF4444",
                  color: "white",
                  borderColor: "#EF4444",
                };
              } else {
                buttonStyle = {
                  ...buttonStyle,
                  opacity: 0.6,
                  cursor: "not-allowed",
                };
              }
            } else {
              buttonStyle = {
                ...buttonStyle,
                cursor: "pointer",
              };
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered}
                style={buttonStyle}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {isAnswered && (
          <div
            style={{
              backgroundColor:
                selectedAnswer === currentQuestion.correctAnswer
                  ? "#D1FAE5"
                  : "#FEE2E2",
              border: `1px solid ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? "#10B981"
                  : "#EF4444"
              }`,
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color:
                  selectedAnswer === currentQuestion.correctAnswer
                    ? "#065F46"
                    : "#991B1B",
                margin: 0,
                fontWeight: "500",
              }}
            >
              {selectedAnswer === currentQuestion.correctAnswer
                ? "Correct! 🎉"
                : `Incorrect. The answer is: ${currentQuestion.correctAnswer}`}
            </p>
          </div>
        )}

        {/* Next Button */}
        {isAnswered && (
          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleNext}
              style={{
                padding: "1rem 2rem",
                backgroundColor: colors.primary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
            >
              {currentQuestionIndex < questions.length - 1
                ? "Next Question"
                : "Finish Quiz"}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
