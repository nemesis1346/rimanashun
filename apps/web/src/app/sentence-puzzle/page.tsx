"use client";

import { useState, useEffect, useRef } from "react";
import { motion, MotionConfig } from "motion/react";
import Layout from "@/components/Layout";
import { colors } from "@/lib/colors";
import { fetchPuzzles, SentencePuzzleItem } from "@/lib/data";
import { useLanguage } from "@/lib/language";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";
import { useSoundEffects } from "@/lib/sound";
import { markLearned } from "@/lib/progress";
import KeyHint from "@/components/KeyHint";

interface Piece {
  id: string;
  text: string;
}

const pieceStyle: React.CSSProperties = {
  position: "relative",
  padding: "0.75rem 1rem",
  backgroundColor: colors.cardBackground,
  color: colors.textPrimary,
  border: `2px solid ${colors.border}`,
  borderRadius: "8px",
  fontSize: "1rem",
  fontWeight: "500",
  userSelect: "none",
};

// The slot under the pointer, if any. `point` is in page coordinates.
function slotAtPoint(point: { x: number; y: number }): number | null {
  const slot = document
    .elementsFromPoint(point.x - window.scrollX, point.y - window.scrollY)
    .find((el) => (el as HTMLElement).dataset.slot !== undefined);
  return slot ? Number((slot as HTMLElement).dataset.slot) : null;
}

interface PuzzlePieceProps {
  piece: Piece;
  locked: boolean;
  onTap: () => void;
  onDragOverSlot: (slotIndex: number | null) => void;
  onDrop: (slotIndex: number | null) => void;
}

// The same layoutId in the pool and in a slot is what makes a piece fly
// between the two when it moves.
function PuzzlePiece({ piece, locked, onTap, onDragOverSlot, onDrop }: PuzzlePieceProps) {
  const wasDragged = useRef(false);

  return (
    <motion.button
      layoutId={piece.id}
      drag={!locked}
      dragSnapToOrigin
      dragMomentum={false}
      whileDrag={{
        scale: 1.08,
        zIndex: 10,
        cursor: "grabbing",
        boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
      }}
      onPointerDown={() => {
        wasDragged.current = false;
      }}
      onDragStart={() => {
        wasDragged.current = true;
      }}
      onDrag={(_, info) => onDragOverSlot(slotAtPoint(info.point))}
      onDragEnd={(_, info) => {
        onDragOverSlot(null);
        onDrop(slotAtPoint(info.point));
      }}
      onClick={() => {
        // Releasing a drag also fires a click, which isn't a tap
        if (!wasDragged.current) onTap();
      }}
      style={{
        ...pieceStyle,
        cursor: locked ? "default" : "grab",
        touchAction: "none",
      }}
    >
      {piece.text}
    </motion.button>
  );
}

export default function SentencePuzzlePage() {
  const { language } = useLanguage();
  const { playCorrect, playWrong } = useSoundEffects();
  const [puzzles, setPuzzles] = useState<SentencePuzzleItem[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [slots, setSlots] = useState<(string | null)[]>([]); // piece ids
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const data = await fetchPuzzles(language);
      setPuzzles(data);
      setCurrentPuzzleIndex(0);
      if (data.length > 0) {
        loadPuzzle(data[0]);
      }
      setIsLoading(false);
    })();
  }, [language]);

  const loadPuzzle = (puzzle: SentencePuzzleItem) => {
    // Shuffle pieces with distractors
    const allPieces = [...puzzle.pieces, ...(puzzle.distractors || [])];
    const shuffledPieces = allPieces
      .map((text, index) => ({ id: `${puzzle.id}-${index}`, text }))
      .sort(() => 0.5 - Math.random());

    setPieces(shuffledPieces);
    setSlots(new Array(puzzle.pieces.length).fill(null));
    setFeedback("");
  };

  const currentPuzzle = puzzles[currentPuzzleIndex];

  // Pass a slot to place the piece there (a piece dragged from another slot
  // swaps with whatever is there), or null to send it back to the pool.
  // Locked once the answer is checked, so the feedback can't go stale.
  const movePiece = (pieceId: string, slotIndex: number | null) => {
    if (feedback) return;

    const newSlots = [...slots];
    const fromSlot = newSlots.indexOf(pieceId);
    if (fromSlot !== -1) {
      newSlots[fromSlot] = slotIndex === null ? null : slots[slotIndex];
    }
    if (slotIndex !== null) {
      newSlots[slotIndex] = pieceId;
    }
    setSlots(newSlots);
  };

  const handlePieceTap = (pieceId: string) => {
    if (slots.includes(pieceId)) {
      movePiece(pieceId, null);
      return;
    }
    const firstEmpty = slots.indexOf(null);
    if (firstEmpty !== -1) {
      movePiece(pieceId, firstEmpty);
    }
  };

  // Dropped outside any slot: a placed piece goes back to the pool, a piece
  // from the pool just snaps back to where it was.
  const handlePieceDrop = (pieceId: string, slotIndex: number | null) => {
    if (slotIndex !== null || slots.includes(pieceId)) {
      movePiece(pieceId, slotIndex);
    }
  };

  const renderPiece = (piece: Piece) => (
    <PuzzlePiece
      piece={piece}
      locked={!!feedback}
      onTap={() => handlePieceTap(piece.id)}
      onDragOverSlot={setHoveredSlot}
      onDrop={(slotIndex) => handlePieceDrop(piece.id, slotIndex)}
    />
  );

  const handleCheckAnswer = () => {
    if (slots.some((slot) => slot === null)) {
      setFeedback("Please fill all slots before checking your answer.");
      return;
    }

    const isCorrect = currentPuzzle.correct_order.every(
      (correctIndex, slotIndex) =>
        pieces.find((piece) => piece.id === slots[slotIndex])?.text ===
        currentPuzzle.pieces[correctIndex]
    );

    if (isCorrect) {
      setFeedback("correct");
      markLearned("learnedPuzzles", currentPuzzle.id);
      playCorrect();
    } else {
      playWrong();
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

  const allFilled = slots.length > 0 && slots.every((slot) => slot !== null);

  useKeyboardShortcuts(
    isLoading || puzzles.length === 0 ? {}
      : feedback ? { Enter: handleNextPuzzle }
      : allFilled ? { Enter: handleCheckAnswer }
      : {}
  );

  if (isLoading) {
    return (
      <Layout>
        <div key="puzzle-loading" style={{ textAlign: "center", padding: "2rem" }}>
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
        <div key="puzzle-empty" style={{ textAlign: "center", padding: "2rem" }}>
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
      <MotionConfig
        reducedMotion="user"
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      >
      <div key="puzzle-active">
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
              {feedback && <KeyHint label="↵" />}
              Next Puzzle
            </button>
          </div>
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            {currentPuzzle?.translation}
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
            {slots.map((slot, index) => {
              const piece = pieces.find((p) => p.id === slot);
              return (
                <div
                  key={index}
                  data-slot={index}
                  style={{
                    minWidth: "120px",
                    height: "60px",
                    border: `2px dashed ${
                      hoveredSlot === index ? colors.primary : colors.border
                    }`,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      hoveredSlot === index
                        ? colors.border
                        : slot
                        ? colors.cardBackground
                        : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  {piece ? (
                    renderPiece(piece)
                  ) : (
                    <span
                      style={{ color: colors.textSecondary, fontSize: "0.9rem" }}
                    >
                      Slot {index + 1}
                    </span>
                  )}
                </div>
              );
            })}
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
            {pieces.map((piece) =>
              slots.includes(piece.id) ? (
                // Empty outline keeps the other words from shifting
                <span
                  key={piece.id}
                  aria-hidden="true"
                  style={{
                    ...pieceStyle,
                    backgroundColor: colors.border,
                    color: "transparent",
                  }}
                >
                  {piece.text}
                </span>
              ) : (
                <div key={piece.id}>{renderPiece(piece)}</div>
              )
            )}
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
            {!feedback && <KeyHint label="↵" />}
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
            <li>Click a word to place it in the next empty slot, or drag it into any slot</li>
            <li>Click a placed word to send it back, or drag it to another slot</li>
            <li>Arrange the words in the correct order</li>
            <li>Click &quot;Check Answer&quot; when you&apos;re ready</li>
          </ul>
        </div>
      </div>
      </MotionConfig>
    </Layout>
  );
}
