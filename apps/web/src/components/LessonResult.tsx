"use client";

import { motion, MotionConfig } from "motion/react";
import { colors } from "@/lib/colors";
import { useLanguage } from "@/lib/language";
import { PASS_THRESHOLD } from "@/lib/path";
import KeyHint from "@/components/KeyHint";
import { uiStrings } from "@rimanashun/shared";

// End screen for a learning-path lesson (quiz or puzzle circle): a
// celebration when it's passed, an encouraging retry screen when it isn't.
// The page decides `passed` (with hasPassed) and wires Enter to onContinue.

const SUCCESS = "#22C55E";
const SUCCESS_DARK = "#15803D";
const RETRY = "#F59E0B";
const RETRY_DARK = "#B45309";
const CONFETTI_COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4"];
const CONFETTI_COUNT = 24;

// Fixed (index-derived) spread rather than Math.random, so renders are
// stable and the burst looks evenly scattered.
const confetti = Array.from({ length: CONFETTI_COUNT }, (_, i) => {
  const angle = (i / CONFETTI_COUNT) * Math.PI * 2 + (i % 3) * 0.2;
  const distance = 110 + ((i * 37) % 70);
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - 30, // bias upward, it then falls
    rotate: (i * 47) % 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: i % 2 === 0,
    delay: (i % 6) * 0.03,
  };
});

function StarIcon({ filled, delay, size }: { filled: boolean; delay: number; size: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 14, delay }}
    >
      <path
        d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
        fill={filled ? "#FACC15" : "#E2E8F0"}
        stroke={filled ? "#CA8A04" : "#CBD5E1"}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

function SuccessBadge() {
  return (
    <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
      {confetti.map((c, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{
            x: c.x,
            y: [0, c.y, c.y + 90],
            opacity: [1, 1, 0],
            scale: 1,
            rotate: c.rotate + 180,
          }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.15 + c.delay, times: [0, 0.45, 1] }}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 10,
            height: c.round ? 10 : 6,
            marginLeft: -5,
            marginTop: -5,
            borderRadius: c.round ? "50%" : 2,
            background: c.color,
          }}
        />
      ))}

      {/* Expanding ring behind the badge */}
      <motion.div
        aria-hidden
        initial={{ scale: 0.6, opacity: 0.8 }}
        animate={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
        style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `6px solid ${SUCCESS}` }}
      />

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 12 }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: SUCCESS,
          boxShadow: `0 8px 0 ${SUCCESS_DARK}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={72} height={72} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          {/* The check draws itself in once the badge has landed */}
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

function RetryBadge() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1, x: [0, 0, -10, 10, -6, 6, 0] }}
      transition={{
        scale: { type: "spring", stiffness: 260, damping: 16 },
        x: { duration: 0.6, delay: 0.3 },
      }}
      style={{
        width: 140,
        height: 140,
        margin: "0 auto",
        borderRadius: "50%",
        background: RETRY,
        boxShadow: `0 8px 0 ${RETRY_DARK}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Circular "try again" arrow, turning once */}
      <motion.svg
        width={68}
        height={68}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ rotate: 0 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 0.9, delay: 0.9, ease: "easeInOut" }}
      >
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </motion.svg>
    </motion.div>
  );
}

const button = (bg: string, edge: string): React.CSSProperties => ({
  width: "100%",
  padding: "0.9rem 1rem",
  border: "none",
  borderRadius: 12,
  background: bg,
  color: "white",
  fontSize: "1.05rem",
  fontWeight: 700,
  letterSpacing: 0.3,
  cursor: "pointer",
  boxShadow: `0 4px 0 ${edge}`,
});

interface LessonResultProps {
  passed: boolean;
  score: number;
  total: number;
  onContinue: () => void;
  onRetry: () => void;
}

export default function LessonResult({ passed, score, total, onContinue, onRetry }: LessonResultProps) {
  const { language } = useLanguage();
  const t = uiStrings[language].path;
  const needed = Math.ceil(total * PASS_THRESHOLD);

  return (
    <MotionConfig reducedMotion="user">
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "2rem 1rem", textAlign: "center" }}>
        {passed ? <SuccessBadge /> : <RetryBadge />}

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ color: passed ? SUCCESS_DARK : RETRY_DARK, fontSize: "1.8rem", margin: "2rem 0 0.75rem" }}
        >
          {passed ? t.lessonComplete : t.lessonFailed}
        </motion.h2>

        {/* One star per correct answer, filling in one after another */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: "0.5rem", flexWrap: "wrap" }}>
          {Array.from({ length: total }, (_, i) => (
            <StarIcon key={i} filled={i < score} delay={0.5 + i * 0.12} size={total > 5 ? 26 : 40} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ color: colors.textSecondary, margin: "0 0 0.5rem", fontWeight: 600 }}
        >
          {t.scoreLine(score, total)}
        </motion.p>
        {!passed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{ color: colors.textSecondary, margin: 0, fontSize: "0.95rem" }}
          >
            {t.needToPass(needed, total)}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "2rem" }}
        >
          {passed ? (
            <motion.button whileTap={{ y: 4, boxShadow: "0 0 0 transparent" }} onClick={onContinue} style={button(SUCCESS, SUCCESS_DARK)}>
              <KeyHint label="↵" />
              {t.backToPath}
            </motion.button>
          ) : (
            <>
              <motion.button whileTap={{ y: 4, boxShadow: "0 0 0 transparent" }} onClick={onRetry} style={button(RETRY, RETRY_DARK)}>
                <KeyHint label="↵" />
                {t.retry}
              </motion.button>
              <motion.button
                whileTap={{ y: 4, boxShadow: "0 0 0 transparent" }}
                onClick={onContinue}
                style={{ ...button("white", colors.border), color: colors.textSecondary, border: `2px solid ${colors.border}` }}
              >
                {t.backToPath}
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
    </MotionConfig>
  );
}
