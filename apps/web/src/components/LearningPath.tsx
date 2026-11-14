"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { colors } from "@/lib/colors";
import { lessonHref, nodeOffset, PathNode, PathUnit } from "@/lib/path";
import { useLanguage } from "@/lib/language";
import { uiStrings } from "@rimanashun/shared";

type PathStrings = (typeof uiStrings)[keyof typeof uiStrings]["path"];

// Geometry (px). The path column is fixed-width and centered; nodes sit on
// a wave inside it and an SVG curve threads through their centers.
const COLUMN_WIDTH = 320;
const NODE_SIZE = 72;
const EDGE = 6; // height of the darker 3D edge under each node
const HALO_GAP = 10; // space between the node and its pulsing halo
// The "start" bubble floats this far above the top of the current node.
const BUBBLE_OFFSET = 18;
const BUBBLE_HEIGHT = 36;
// Gap between a unit header and its first node: room for the bubble plus a
// little air, so the bubble on a unit's first lesson isn't hidden under the
// header (which is layered above the nodes so it can stick while scrolling).
const HEADER_GAP = BUBBLE_OFFSET + BUBBLE_HEIGHT + 20;
const ROW_GAP = 104;
const AMPLITUDE = 80;
const LOCKED = "#CBD5E1";
const LOCKED_DARK = "#94A3B8";

function shade(hex: string, amount: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const f = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + (amount < 0 ? c : 255 - c) * amount)));
  const r = f(n >> 16), g = f((n >> 8) & 0xff), b = f(n & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Category colors are pastels; pick a readable icon color on top of them.
function isLight(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 0xff, n & 0xff];
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
}

const nodeCenter = (node: PathNode, i: number) => ({
  x: COLUMN_WIDTH / 2 + nodeOffset(node.globalIndex) * AMPLITUDE,
  y: i * ROW_GAP + NODE_SIZE / 2,
});

function curveThrough(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  return points.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const midY = (prev.y + p.y) / 2;
    return `${d} C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
  }, "");
}

function NodeIcon({ node, color }: { node: PathNode; color: string }) {
  const common = { width: 32, height: 32, viewBox: "0 0 24 24", fill: color };
  if (node.state === "locked") {
    return (
      <svg {...common}>
        <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9z" />
      </svg>
    );
  }
  if (node.state === "completed" && node.kind === "lesson") {
    return (
      <svg {...common} fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    );
  }
  if (node.kind === "checkpoint") {
    // Chakana-style stepped cross as the unit checkpoint mark.
    return (
      <svg {...common}>
        <path d="M9 2h6v4h3v3h4v6h-4v3h-3v4H9v-4H6v-3H2V9h4V6h3V2zm1.5 7.5v5h3v-5h-3z" />
      </svg>
    );
  }
  if (node.activity === "puzzle") {
    return (
      <svg {...common}>
        <path d="M10 3a2 2 0 0 1 4 0v1h4a1 1 0 0 1 1 1v4h-1a2 2 0 1 0 0 4h1v4a1 1 0 0 1-1 1h-4v-1a2 2 0 1 0-4 0v1H6a1 1 0 0 1-1-1v-4h1a2 2 0 1 0 0-4H5V5a1 1 0 0 1 1-1h4V3z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
    </svg>
  );
}

interface NodeProps {
  node: PathNode;
  unitColor: string;
  title: string;
  isOpen: boolean;
  celebrate: boolean;
  t: PathStrings;
  onToggle: () => void;
  onStart: () => void;
}

function PathNodeButton({ node, unitColor, title, isOpen, celebrate, t, onToggle, onStart }: NodeProps) {
  const locked = node.state === "locked";
  const face = locked ? LOCKED : unitColor;
  const edge = locked ? LOCKED_DARK : shade(unitColor, -0.3);
  const iconColor = locked ? "#F8FAFC" : isLight(unitColor) ? colors.textPrimary : "#FFFFFF";
  const isCurrent = node.state === "current";
  const [shake, setShake] = useState(0);

  return (
    <div style={{ position: "relative", width: NODE_SIZE, height: NODE_SIZE }}>
      {/* Pulsing halo behind the current lesson. Centered on the whole
          visible disc (face + EDGE-px 3D edge below it), not just the face,
          or it reads as sitting too high. */}
      {isCurrent && (
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            left: -HALO_GAP,
            top: EDGE / 2 - HALO_GAP,
            width: NODE_SIZE + HALO_GAP * 2,
            height: NODE_SIZE + HALO_GAP * 2,
            borderRadius: "50%",
            pointerEvents: "none",
            border: `4px solid ${unitColor}`,
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.15, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Bouncing "start" bubble above the current lesson */}
      {isCurrent && !isOpen && (
        <motion.div
          style={{
            position: "absolute",
            bottom: NODE_SIZE + BUBBLE_OFFSET,
            left: "50%",
            x: "-50%",
            background: "white",
            color: shade(unitColor, -0.35),
            border: `2px solid ${colors.border}`,
            borderRadius: 12,
            padding: "6px 14px",
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: 1,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          {t.start}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              marginLeft: -7,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: `7px solid ${colors.border}`,
            }}
          />
        </motion.div>
      )}

      <motion.button
        type="button"
        aria-label={locked ? `${title} (${t.locked})` : title}
        onClick={() => (locked ? setShake((s) => s + 1) : onToggle())}
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        animate={
          shake
            ? { x: shake % 2 ? [0, -8, 8, -6, 6, 0] : [0, 8, -8, 6, -6, 0] }
            : celebrate
              ? { scale: [1, 1.3, 0.95, 1.05, 1], rotate: [0, -8, 8, 0] }
              : undefined
        }
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        whileHover={locked ? undefined : { scale: 1.06 }}
        whileTap={locked ? undefined : { y: EDGE, boxShadow: `0 0px 0 ${edge}` }}
        style={{
          position: "relative",
          width: NODE_SIZE,
          height: NODE_SIZE,
          padding: 0,
          borderRadius: "50%",
          border: "none",
          background: face,
          boxShadow: `0 ${EDGE}px 0 ${edge}`,
          cursor: locked ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NodeIcon node={node} color={iconColor} />
      </motion.button>

      {/* Lesson popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              position: "absolute",
              top: NODE_SIZE + 18,
              left: "50%",
              x: "-50%",
              width: 240,
              zIndex: 20,
              background: unitColor,
              color: iconColor,
              borderRadius: 16,
              padding: 16,
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.2)",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{title}</div>
            <div style={{ opacity: 0.85, fontSize: 14, marginBottom: 12 }}>
              {node.state === "completed" ? t.completedHint : node.activity === "puzzle" ? t.puzzleHint : t.lessonHint}
            </div>
            <motion.button
              type="button"
              onClick={onStart}
              whileTap={{ y: 4, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
              style={{
                width: "100%",
                padding: "12px 0",
                border: "none",
                borderRadius: 12,
                background: "white",
                color: shade(unitColor, -0.45),
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: 0.5,
                cursor: "pointer",
                boxShadow: `0 4px 0 ${shade(unitColor, -0.3)}`,
              }}
            >
              {node.state === "completed" ? t.practice : t.start}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UnitSection({
  unit,
  unitNumber,
  openId,
  celebrateId,
  setOpenId,
  onStart,
  t,
}: {
  unit: PathUnit;
  unitNumber: number;
  openId: string | null;
  celebrateId: string | null;
  setOpenId: (id: string | null) => void;
  onStart: (node: PathNode) => void;
  t: PathStrings;
}) {
  const { category, nodes } = unit;
  const points = nodes.map(nodeCenter);
  const reached = nodes.filter((n) => n.state !== "locked").length;
  const height = (nodes.length - 1) * ROW_GAP + NODE_SIZE + 8;
  const textColor = isLight(category.color) ? colors.textPrimary : "#FFFFFF";

  return (
    <section style={{ marginBottom: 48 }}>
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          position: "sticky",
          top: 8,
          zIndex: 10,
          background: category.color,
          color: textColor,
          borderRadius: 16,
          padding: "16px 20px",
          marginBottom: HEADER_GAP,
          boxShadow: `0 4px 0 ${shade(category.color, -0.3)}`,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.8, letterSpacing: 1 }}>
          {t.unit} {unitNumber}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{category.name}</div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>{category.description}</div>
      </motion.header>

      <div style={{ position: "relative", width: COLUMN_WIDTH, height, margin: "0 auto" }}>
        <svg
          width={COLUMN_WIDTH}
          height={height}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
          aria-hidden
        >
          {/* Full route, dashed and muted */}
          <path
            d={curveThrough(points)}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray="2 18"
          />
          {/* Travelled part, drawn in as it scrolls into view */}
          {reached > 1 && (
            <motion.path
              d={curveThrough(points.slice(0, reached))}
              fill="none"
              stroke={category.color}
              strokeWidth={10}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          )}
        </svg>

        {nodes.map((node, i) => {
          const { x, y } = points[i];
          return (
            <div
              key={node.id}
              data-path-node
              data-current={node.state === "current" || undefined}
              style={{
                position: "absolute",
                left: x - NODE_SIZE / 2,
                top: y - NODE_SIZE / 2,
                zIndex: openId === node.id ? 15 : 1,
              }}
            >
              <PathNodeButton
                node={node}
                unitColor={category.color}
                title={
                  node.kind === "checkpoint"
                    ? `${category.name}: ${t.review}`
                    : `${category.name} · ${t.lesson} ${node.index + 1}`
                }
                isOpen={openId === node.id}
                celebrate={celebrateId === node.id}
                t={t}
                onToggle={() => setOpenId(openId === node.id ? null : node.id)}
                onStart={() => onStart(node)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function LearningPath({ units }: { units: PathUnit[] }) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = uiStrings[language].path;
  const rootRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

  // Celebrate the lesson just finished (set by the quiz page), then bring
  // the current node into view.
  useEffect(() => {
    try {
      const just = sessionStorage.getItem("justCompletedLesson");
      if (just) {
        sessionStorage.removeItem("justCompletedLesson");
        setCelebrateId(just);
      }
    } catch {
      // sessionStorage unavailable
    }
    const current = rootRef.current?.querySelector("[data-current]");
    current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // Close the popover when clicking anywhere else.
  useEffect(() => {
    if (!openId) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-path-node]")) setOpenId(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openId]);

  const start = (node: PathNode) => router.push(lessonHref(node));

  return (
    <div ref={rootRef} style={{ maxWidth: 480, margin: "0 auto", paddingTop: 8 }}>
      {units.map((unit, i) => (
        <UnitSection
          key={unit.category.id}
          unit={unit}
          unitNumber={i + 1}
          openId={openId}
          celebrateId={celebrateId}
          setOpenId={setOpenId}
          onStart={start}
          t={t}
        />
      ))}
    </div>
  );
}
