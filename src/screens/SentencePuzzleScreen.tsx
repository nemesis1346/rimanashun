import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../constants/colors";

type PuzzleItem = {
  id: string;
  language: string;
  type: string;
  surface: string;
  translation_en: string;
  pieces: string[];
  correct_order: number[];
  distractors?: string[];
};

const ALL_PUZZLES: PuzzleItem[] = require("../../assets/sentence_puzzles_kichwa.json");

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function SentencePuzzleScreen() {
  const [index, setIndex] = useState(0);

  const item = useMemo(() => ALL_PUZZLES[index % ALL_PUZZLES.length], [index]);
  const [pool, setPool] = useState<string[]>(() =>
    shuffle([
      ...(item?.pieces || []),
      ...((item?.distractors as string[]) || []),
    ])
  );
  const [slots, setSlots] = useState<string[]>(() =>
    Array(item?.pieces?.length || 0).fill("")
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");
  const [correctSentence, setCorrectSentence] = useState<string>("");
  const lift = useMemo(() => new Animated.Value(0), [item?.id]);

  const resetForItem = (nextIndex?: number) => {
    const current = ALL_PUZZLES[(nextIndex ?? index) % ALL_PUZZLES.length];
    setPool(
      shuffle([
        ...(current.pieces || []),
        ...((current.distractors as string[]) || []),
      ])
    );
    setSlots(Array(current.pieces.length).fill(""));
    setPicked(null);
    setFeedback("");
    setCorrectSentence("");
    lift.setValue(0);
  };

  const onPickPiece = (piece: string) => {
    if (picked === piece) {
      // drop back
      setPicked(null);
      Animated.spring(lift, { toValue: 0, useNativeDriver: true }).start();
      return;
    }
    setPicked(piece);
    Animated.spring(lift, { toValue: -6, useNativeDriver: true }).start();
  };

  const onPlaceInSlot = (slotIdx: number) => {
    if (!picked) return;
    if (slots[slotIdx]) return; // occupied
    // remove from pool
    const newPool = [...pool];
    const poolIdx = newPool.indexOf(picked);
    if (poolIdx !== -1) newPool.splice(poolIdx, 1);
    const newSlots = [...slots];
    newSlots[slotIdx] = picked;
    setPool(newPool);
    setSlots(newSlots);
    setPicked(null);
    Animated.spring(lift, { toValue: 0, useNativeDriver: true }).start();
  };

  const onRemoveFromSlot = (slotIdx: number) => {
    const piece = slots[slotIdx];
    if (!piece) return;
    const newSlots = [...slots];
    newSlots[slotIdx] = "";
    setSlots(newSlots);
    setPool(shuffle([...pool, piece]));
  };

  const checkAnswer = () => {
    const expected = item.pieces;
    const isFilled = slots.every((s) => !!s);
    if (!isFilled) {
      setCorrectSentence(item.surface || expected.join(" "));
      setFeedback("wrong");
      return;
    }
    const isCorrect = slots.join(" ") === expected.join(" ");
    setFeedback(isCorrect ? "correct" : "wrong");
    setCorrectSentence(isCorrect ? "" : item.surface || expected.join(" "));
  };

  const next = () => {
    const nextIdx = (index + 1) % ALL_PUZZLES.length;
    setIndex(nextIdx);
    resetForItem(nextIdx);
  };

  const renderPoolPiece = ({ item: piece }: { item: string }) => (
    <TouchableOpacity
      onPress={() => onPickPiece(piece)}
      style={styles.poolPieceWrapper}
    >
      <Animated.View
        style={[
          styles.piece,
          picked === piece && {
            backgroundColor: colors.primary,
            transform: [{ translateY: lift }],
          },
        ]}
      >
        <Text
          style={[styles.pieceText, picked === piece && { color: "white" }]}
        >
          {piece}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.primaryGradient} style={styles.header}>
        <Text style={styles.title}>Sentence Puzzle</Text>
        <Text style={styles.subtitle}>Arrange the Kichwa sentence</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.promptLabel}>English</Text>
        <Text style={styles.prompt}>{item.translation_en}</Text>

        <Text style={styles.promptLabel}>Target</Text>
        <View style={styles.slotsRow}>
          {slots.map((s, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => (s ? onRemoveFromSlot(i) : onPlaceInSlot(i))}
              style={[styles.slot, s && styles.slotFilled]}
            >
              <Text style={styles.slotText}>{s || ""}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.promptLabel, { marginTop: 12 }]}>Pieces</Text>
        <FlatList
          data={pool}
          keyExtractor={(p, i) => p + i}
          renderItem={renderPoolPiece}
          numColumns={3}
          contentContainerStyle={{ paddingTop: 6 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />

        {feedback !== "" && (
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <Text
              style={[
                styles.feedback,
                feedback === "correct" ? styles.correct : styles.wrong,
              ]}
            >
              {feedback === "correct" ? "Correct!" : "Incorrect."}
            </Text>
            {feedback === "wrong" && !!correctSentence && (
              <Text style={styles.correctAnswerText}>{correctSentence}</Text>
            )}
          </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={checkAnswer}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.buttonText}>Check</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => resetForItem()}
            style={[styles.button, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={next}
            style={[styles.button, { backgroundColor: colors.secondary }]}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 48,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  card: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  promptLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  prompt: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#222",
  },
  slotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8 as any,
  },
  slot: {
    minHeight: 40,
    minWidth: 70,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  slotFilled: {
    backgroundColor: "#eef7ff",
    borderColor: "#cfe8ff",
  },
  slotText: {
    fontSize: 16,
    color: "#333",
  },
  poolPieceWrapper: {
    width: "32%",
    marginBottom: 10,
  },
  piece: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  pieceText: {
    fontSize: 16,
    color: "#222",
  },
  feedback: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  correct: { color: "#1e9e59" },
  wrong: { color: "#d9534f" },
  correctAnswerText: {
    marginTop: 4,
    fontSize: 16,
    color: "#333",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
