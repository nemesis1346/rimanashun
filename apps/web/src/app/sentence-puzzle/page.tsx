"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, MotionConfig } from "motion/react";
import Layout from "@/components/Layout";
import { colors } from "@/lib/colors";
import { fetchPuzzles, SentencePuzzleItem } from "@/lib/data";
import { useLanguage } from "@/lib/language";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";
import { useSoundEffects } from "@/lib/sound";
import { markLearned } from "@/lib/progress";
import { hasPassed, puzzlesForSlot } from "@/lib/path";
import { uiStrings } from "@rimanashun/shared";
import KeyHint from "@/components/KeyHint";
import LessonResult from "@/components/LessonResult";

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

// How long the "Correct!" message stays before the next puzzle loads.
const AUTO_ADVANCE_MS = 1200;

function SentencePuzzlePage() {
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Set when started from a puzzle node on the learning path: play only that
  // lesson's puzzles, then show a result screen instead of looping forever.
  const lessonId = searchParams?.get("lesson") ?? null;
  const slot = Number(searchParams?.get("slot") ?? 0);
  // Puzzle ids answered correctly in this lesson (a set, so re-checking a
  // solved puzzle can't count twice).
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [lessonDone, setLessonDone] = useState(false);
  const { playCorrect, playWrong } = useSoundEffects();
  const [puzzles, setPuzzles] = useState<SentencePuzzleItem[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [slots, setSlots] = useState<(string | null)[]>([]); // piece ids
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  // "incomplete" is only a hint (keep placing words); "correct"/"incorrect"
  // mean the answer was checked, which locks the pieces until the next puzzle.
  const [feedback, setFeedback] = useState<"" | "incomplete" | "correct" | "incorrect">("");
  const checked = feedback === "correct" || feedback === "incorrect";
  const t = uiStrings[language].puzzle;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const all = await fetchPuzzles(language);
      const data = lessonId ? puzzlesForSlot(all, slot) : all;
      setPuzzles(data);
      setSolved(new Set());
      setLessonDone(false);
      setCurrentPuzzleIndex(0);
      if (data.length > 0) {
        loadPuzzle(data[0]);
      }
      setIsLoading(false);
    })();
  }, [language, lessonId, slot]);

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
    if (checked) return;

    const newSlots = [...slots];
    const fromSlot = newSlots.indexOf(pieceId);
    if (fromSlot !== -1) {
      newSlots[fromSlot] = slotIndex === null ? null : slots[slotIndex];
    }
    if (slotIndex !== null) {
      newSlots[slotIndex] = pieceId;
    }
    setSlots(newSlots);
    if (feedback === "incomplete") setFeedback("");
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
      locked={checked}
      onTap={() => handlePieceTap(piece.id)}
      onDragOverSlot={setHoveredSlot}
      onDrop={(slotIndex) => handlePieceDrop(piece.id, slotIndex)}
    />
  );

  const handleCheckAnswer = () => {
    if (checked) return;
    if (slots.some((slot) => slot === null)) {
      setFeedback("incomplete");
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
      setSolved((prev) => new Set(prev).add(currentPuzzle.id));
      playCorrect();
    } else {
      playWrong();
      setFeedback("incorrect");
    }
  };

  const handleNextPuzzle = () => {
    if (lessonId && currentPuzzleIndex === puzzles.length - 1) {
      if (hasPassed(solved.size, puzzles.length)) {
        markLearned("completedLessons", lessonId);
        try {
          sessionStorage.setItem("justCompletedLesson", lessonId);
        } catch {
          // sessionStorage unavailable
        }
      }
      setLessonDone(true);
      return;
    }
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
      loadPuzzle(puzzles[currentPuzzleIndex + 1]);
    } else {
      setCurrentPuzzleIndex(0);
      loadPuzzle(puzzles[0]);
    }
  };

  // After a correct answer, move on by itself once the success message has
  // been seen. Wrong answers wait for "Continue" so the correct sentence can
  // be read. The ref always holds the latest handleNextPuzzle, so the timer
  // sees up-to-date state (e.g. the puzzle just solved) when it fires.
  const nextPuzzleRef = useRef(handleNextPuzzle);
  useEffect(() => {
    nextPuzzleRef.current = handleNextPuzzle;
  });
  useEffect(() => {
    if (feedback !== "correct") return;
    const timer = setTimeout(() => nextPuzzleRef.current(), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [feedback, currentPuzzleIndex]);

  const handleReset = () => {
    if (currentPuzzle && !checked) {
      loadPuzzle(currentPuzzle);
    }
  };

  const allFilled = slots.length > 0 && slots.every((slot) => slot !== null);

  const lessonPassed = hasPassed(solved.size, puzzles.length);
  const backToPath = () => router.push("/");
  const retryLesson = () => {
    setSolved(new Set());
    setCurrentPuzzleIndex(0);
    loadPuzzle(puzzles[0]);
    setLessonDone(false);
  };

  useKeyboardShortcuts(
    isLoading || puzzles.length === 0 ? {}
      : lessonDone ? { Enter: lessonPassed ? backToPath : retryLesson }
      : checked ? { Enter: handleNextPuzzle }
      : allFilled ? { Enter: handleCheckAnswer }
      : {}
  );

  if (isLoading) {
    return (
      <Layout>
        <div key="puzzle-loading" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: colors.textSecondary }}>
            {t.loading}
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
            {t.emptyTitle}
          </h2>
          <p style={{ color: colors.textSecondary }}>
            {t.emptyBody}
          </p>
        </div>
      </Layout>
    );
  }

  if (lessonDone) {
    return (
      <Layout>
        <div key="puzzle-lesson-done">
          <LessonResult
            passed={lessonPassed}
            score={solved.size}
            total={puzzles.length}
            onContinue={backToPath}
            onRetry={retryLesson}
          />
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
        {/* Lessons are a short run toward the end screen, so they get no
            title, just the bar. Free play keeps its title. */}
        {!lessonId && (
          <h2 style={{ color: colors.textPrimary, marginBottom: "1.5rem" }}>
            {t.title}
          </h2>
        )}

        {/* Progress: fills as each puzzle is answered */}
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={puzzles.length}
          aria-valuenow={currentPuzzleIndex + (checked ? 1 : 0)}
          style={{
            height: 16,
            background: "#E2E8F0",
            borderRadius: 999,
            overflow: "hidden",
            marginBottom: "2rem",
          }}
        >
          <motion.div
            initial={false}
            animate={{
              width: `${((currentPuzzleIndex + (checked ? 1 : 0)) / puzzles.length) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{
              height: "100%",
              background: colors.secondary,
              borderRadius: 999,
              // the lighter stripe gives the bar a little depth
              boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.12), inset 0 4px 0 rgba(255,255,255,0.25)",
            }}
          />
        </div>

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
          <p style={{ color: colors.textPrimary, margin: 0, fontSize: "1.15rem", fontWeight: 600 }}>
            {currentPuzzle?.translation}
          </p>
        </div>

        {/* Sentence Slots */}
        <div style={{ marginBottom: "2rem" }}>
          <h4 style={{ color: colors.textPrimary, marginBottom: "1rem" }}>
            {t.instruction}
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
            {t.availableWords}
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
            {!checked && <KeyHint label="↵" />}
            {t.check}
          </button>

          <button
            onClick={handleReset}
            disabled={checked}
            style={{
              padding: "1rem 2rem",
              backgroundColor: colors.secondary,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: checked ? "not-allowed" : "pointer",
              opacity: checked ? 0.5 : 1,
              fontSize: "1.1rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
          >
            {t.reset}
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
              {feedback === "correct"
                ? t.correct
                : feedback === "incorrect"
                  ? t.incorrect(currentPuzzle.surface)
                  : t.incomplete}
            </p>
            {feedback === "incorrect" && (
              <button
                onClick={handleNextPuzzle}
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem 2rem",
                  backgroundColor: "#EF4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                <KeyHint label="↵" />
                {t.continue}
              </button>
            )}
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
            {t.howToPlay}
          </h4>
          <ul
            style={{
              color: colors.textSecondary,
              margin: 0,
              paddingLeft: "1.5rem",
            }}
          >
            {t.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
      </MotionConfig>
    </Layout>
  );
}

export default function SentencePuzzlePageWrapper() {
  return <Suspense><SentencePuzzlePage /></Suspense>;
}
