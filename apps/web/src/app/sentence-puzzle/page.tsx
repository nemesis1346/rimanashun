"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { colors } from "@/lib/colors";
import { sentencePuzzleData, SentencePuzzleItem } from "@/lib/data";

export default function SentencePuzzlePage() {
  const [puzzles, setPuzzles] = useState<SentencePuzzleItem[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [pieces, setPieces] = useState<string[]>([]);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [pickedPiece, setPickedPiece] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPuzzles(sentencePuzzleData);
    if (sentencePuzzleData.length > 0) {
      loadPuzzle(sentencePuzzleData[0]);
    }
    setIsLoading(false);
  }, []);

  const loadPuzzle = (puzzle: SentencePuzzleItem) => {
    // Shuffle pieces with distractors
    const allPieces = [...puzzle.pieces, ...puzzle.distractors];
    const shuffledPieces = allPieces.sort(() => 0.5 - Math.random());

    setPieces(shuffledPieces);
    setSlots(new Array(puzzle.pieces.length).fill(null));
    setPickedPiece(null);
    setFeedback("");
  };

  const currentPuzzle = puzzles[currentPuzzleIndex];

  const handlePieceClick = (piece: string) => {
    if (pickedPiece === piece) {
      setPickedPiece(null);
    } else {
      setPickedPiece(piece);
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    if (!pickedPiece) return;

    const newSlots = [...slots];
    newSlots[slotIndex] = pickedPiece;
    setSlots(newSlots);

    // Remove piece from pool
    setPieces(pieces.filter((p) => p !== pickedPiece));
    setPickedPiece(null);
  };

  const handleCheckAnswer = () => {
    if (slots.some((slot) => slot === null)) {
      setFeedback("Please fill all slots before checking your answer.");
      return;
    }

    const isCorrect = currentPuzzle.correct_order.every(
      (correctIndex, slotIndex) =>
        slots[slotIndex] === currentPuzzle.pieces[correctIndex]
    );

    if (isCorrect) {
      setFeedback("correct");
    } else {
      setFeedback(`Incorrect. Correct sentence: ${currentPuzzle.surface}`);
    }
  };

  const handleNextPuzzle = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
      loadPuzzle(puzzles[currentPuzzleIndex + 1]);
    } else {
      setCurrentPuzzleIndex(0);
      loadPuzzle(puzzles[0]);
    }
  };

  const handleReset = () => {
    if (currentPuzzle) {
      loadPuzzle(currentPuzzle);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: colors.textSecondary }}>
            Loading sentence puzzles...
          </p>
        </div>
      </Layout>
    );
  }

  if (puzzles.length === 0) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2 style={{ color: colors.textPrimary, marginBottom: "1rem" }}>
            No sentence puzzles available
          </h2>
          <p style={{ color: colors.textSecondary }}>
            Please add sentence puzzle data to get started.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <h2 style={{ color: colors.textPrimary, marginBottom: "2rem" }}>
          Sentence Puzzle
        </h2>

        {/* Puzzle Info */}
        <div
          style={{
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ color: colors.textPrimary, margin: 0 }}>
              Puzzle {currentPuzzleIndex + 1} of {puzzles.length}
            </h3>
            <button
              onClick={handleNextPuzzle}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: colors.secondary,
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Next Puzzle
            </button>
          </div>
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            <strong>English:</strong> {currentPuzzle?.translation_en}
          </p>
        </div>

        {/* Sentence Slots */}
        <div style={{ marginBottom: "2rem" }}>
          <h4 style={{ color: colors.textPrimary, marginBottom: "1rem" }}>
            Arrange the words to form the correct sentence:
          </h4>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
            {slots.map((slot, index) => (
              <div
                key={index}
                onClick={() => handleSlotClick(index)}
                style={{
                  minWidth: "120px",
                  height: "60px",
                  border: `2px dashed ${colors.border}`,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: pickedPiece ? "pointer" : "default",
                  backgroundColor: slot ? colors.cardBackground : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                {slot ? (
                  <span
                    style={{
                      color: colors.textPrimary,
                      fontWeight: "500",
                      fontSize: "1.1rem",
                    }}
                  >
                    {slot}
                  </span>
                ) : (
                  <span
                    style={{ color: colors.textSecondary, fontSize: "0.9rem" }}
                  >
                    Slot {index + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Available Pieces */}
        <div style={{ marginBottom: "2rem" }}>
          <h4 style={{ color: colors.textPrimary, marginBottom: "1rem" }}>
            Available words:
          </h4>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            {pieces.map((piece, index) => (
              <button
                key={index}
                onClick={() => handlePieceClick(piece)}
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor:
                    pickedPiece === piece
                      ? colors.primary
                      : colors.cardBackground,
                  color: pickedPiece === piece ? "white" : colors.textPrimary,
                  border: `2px solid ${
                    pickedPiece === piece ? colors.primary : colors.border
                  }`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  transform:
                    pickedPiece === piece
                      ? "translateY(-2px)"
                      : "translateY(0)",
                  boxShadow:
                    pickedPiece === piece
                      ? "0 4px 8px rgba(0,0,0,0.1)"
                      : "none",
                }}
              >
                {piece}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            marginBottom: "2rem",
          }}
        >
          <button
            onClick={handleCheckAnswer}
            disabled={slots.some((slot) => slot === null)}
            style={{
              padding: "1rem 2rem",
              backgroundColor: slots.some((slot) => slot === null)
                ? colors.border
                : colors.primary,
              color: slots.some((slot) => slot === null)
                ? colors.textSecondary
                : "white",
              border: "none",
              borderRadius: "8px",
              cursor: slots.some((slot) => slot === null)
                ? "not-allowed"
                : "pointer",
              fontSize: "1.1rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
          >
            Check Answer
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: "1rem 2rem",
              backgroundColor: colors.secondary,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1.1rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
          >
            Reset
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            style={{
              backgroundColor: feedback === "correct" ? "#D1FAE5" : "#FEE2E2",
              border: `1px solid ${
                feedback === "correct" ? "#10B981" : "#EF4444"
              }`,
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: feedback === "correct" ? "#065F46" : "#991B1B",
                margin: 0,
                fontWeight: "500",
              }}
            >
              {feedback === "correct" ? "Correct! 🎉" : feedback}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div
          style={{
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            padding: "1.5rem",
          }}
        >
          <h4 style={{ color: colors.textPrimary, margin: "0 0 1rem 0" }}>
            🧩 How to Play
          </h4>
          <ul
            style={{
              color: colors.textSecondary,
              margin: 0,
              paddingLeft: "1.5rem",
            }}
          >
            <li>Click on a word to select it (it will be highlighted)</li>
            <li>Click on an empty slot to place the selected word</li>
            <li>Arrange all words in the correct order</li>
            <li>Click "Check Answer" when you're ready</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
