"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { colors } from "@/lib/colors";
import { fetchVocabulary, KichwaWord } from "@/lib/data";

export default function FlashcardsPage() {
  const [words, setWords] = useState<KichwaWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await fetchVocabulary();
      setWords(data);
      setIsLoading(false);
    })();
  }, []);

  const currentWord = words[currentIndex];
  const progress =
    words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowTranslation(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTranslation(false);
    }
  };

  const handleFlip = () => {
    setShowTranslation(!showTranslation);
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: colors.textSecondary }}>Loading flashcards...</p>
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

  return (
    <Layout>
      <div>
        <h2 style={{ color: colors.textPrimary, marginBottom: "2rem" }}>
          Flashcards
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
              {currentIndex + 1} of {words.length}
            </span>
            <span style={{ color: colors.textSecondary, fontSize: "0.9rem" }}>
              {Math.round(progress)}%
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

        {/* Flashcard */}
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto 2rem auto",
            perspective: "1000px",
          }}
        >
          <div
            onClick={handleFlip}
            style={{
              width: "100%",
              height: "300px",
              position: "relative",
              transformStyle: "preserve-3d",
              cursor: "pointer",
              transition: "transform 0.6s",
              transform: showTranslation ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front of card */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                backgroundColor: colors.cardBackground,
                border: `2px solid ${colors.border}`,
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "2rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <h3
                  style={{
                    color: colors.primary,
                    fontSize: "2rem",
                    margin: "0 0 1rem 0",
                    fontWeight: "bold",
                  }}
                >
                  {currentWord?.kichwa}
                </h3>
                <p style={{ color: colors.textSecondary, margin: 0 }}>
                  Click to reveal translation
                </p>
              </div>
            </div>

            {/* Back of card */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                backgroundColor: colors.primary,
                color: "white",
                border: `2px solid ${colors.primary}`,
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "2rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transform: "rotateY(180deg)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <h3
                  style={{
                    color: "white",
                    fontSize: "2rem",
                    margin: "0 0 1rem 0",
                    fontWeight: "bold",
                  }}
                >
                  {currentWord?.spanish}
                </h3>
                <p style={{ color: "white", opacity: 0.9, margin: 0 }}>
                  {currentWord?.category && `Category: ${currentWord.category}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor:
                currentIndex === 0 ? colors.border : colors.secondary,
              color: currentIndex === 0 ? colors.textSecondary : "white",
              border: "none",
              borderRadius: "8px",
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
          >
            ← Previous
          </button>

          <button
            onClick={handleFlip}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: colors.accent,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
          >
            {showTranslation ? "Show Kichwa" : "Show Translation"}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === words.length - 1}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor:
                currentIndex === words.length - 1
                  ? colors.border
                  : colors.primary,
              color:
                currentIndex === words.length - 1
                  ? colors.textSecondary
                  : "white",
              border: "none",
              borderRadius: "8px",
              cursor:
                currentIndex === words.length - 1 ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
          >
            Next →
          </button>
        </div>

        {/* Study Tips */}
        <div
          style={{
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            padding: "1.5rem",
            marginTop: "2rem",
          }}
        >
          <h4 style={{ color: colors.textPrimary, margin: "0 0 1rem 0" }}>
            💡 Study Tips
          </h4>
          <ul
            style={{
              color: colors.textSecondary,
              margin: 0,
              paddingLeft: "1.5rem",
            }}
          >
            <li>Try to recall the translation before flipping the card</li>
            <li>Review difficult words more frequently</li>
            <li>Practice regularly for better retention</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
