"use client";

import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import { colors } from "@/lib/colors";
import { fetchVocabulary, fetchPuzzles, fetchCategories, KichwaWord, Category } from "@/lib/data";
import { useLanguage } from "@/lib/language";
import { getAllProgress, onProgressChanged, Progress } from "@/lib/progress";
import { buildPath, LESSONS_PER_UNIT } from "@/lib/path";
import {
  categoryProgress,
  countLearnedWords,
  currentStreak,
  lastActiveDay,
  longestStreak,
  recentDays,
} from "@/lib/stats";

const card: React.CSSProperties = {
  backgroundColor: colors.cardBackground,
  border: `1px solid ${colors.border}`,
  borderRadius: "12px",
  padding: "1.5rem",
};

function StatCard({ icon, value, label, sub }: { icon: string; value: string; label: string; sub?: string }) {
  return (
    <div style={{ ...card, textAlign: "center" }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
      <h3 style={{ color: colors.textPrimary, margin: "0 0 0.5rem 0" }}>{value}</h3>
      <p style={{ color: colors.textSecondary, margin: 0, fontSize: "0.9rem" }}>{label}</p>
      {sub && (
        <p style={{ color: colors.textSecondary, margin: "0.25rem 0 0 0", fontSize: "0.8rem", opacity: 0.8 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function formatDay(day: string, locale: string) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
}

export default function ProgressPage() {
  const { language } = useLanguage();
  const [words, setWords] = useState<KichwaWord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPuzzles, setTotalPuzzles] = useState(0);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const readProgress = useCallback(() => setProgress(getAllProgress()), []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const [vocab, puzzles, cats] = await Promise.all([
        fetchVocabulary(language),
        fetchPuzzles(language),
        fetchCategories(language),
      ]);
      setWords(vocab);
      setTotalPuzzles(puzzles.length);
      setCategories(cats);
      readProgress();
      setIsLoading(false);
    })();
  }, [language, readProgress]);

  // Re-read after a sync pulls in progress from the account
  useEffect(() => onProgressChanged(readProgress), [readProgress]);

  if (isLoading || !progress) {
    return (
      <Layout>
        <div key="progress-loading" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: colors.textSecondary }}>Loading progress...</p>
        </div>
      </Layout>
    );
  }

  const locale = language === "es" ? "es-EC" : "en-US";
  const learnedWords = countLearnedWords(words, progress.learnedWords);
  const learnedPuzzles = progress.learnedPuzzles.length;
  // Same count as the bar on the home path (lessons unlock in order)
  const lessonsDone = buildPath(categories, progress.completedLessons)
    .flatMap((u) => u.nodes)
    .filter((n) => n.state === "completed").length;
  const lessonsTotal = categories.length * LESSONS_PER_UNIT;
  const streak = currentStreak(progress.activeDays);
  const best = longestStreak(progress.activeDays);
  const lastDay = lastActiveDay(progress.activeDays);
  const week = recentDays(progress.activeDays, 7);
  const byCategory = categoryProgress(words, categories, progress.learnedWords);

  return (
    <Layout>
      <div key="progress-active">
        <h2 style={{ color: colors.textPrimary, marginBottom: "2rem" }}>Progress</h2>

        {/* Overview Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <StatCard icon="📚" value={`${learnedWords} / ${words.length}`} label="Words learned" />
          <StatCard icon="🧩" value={`${learnedPuzzles} / ${totalPuzzles}`} label="Sentence puzzles solved" />
          <StatCard icon="⭐" value={`${lessonsDone} / ${lessonsTotal}`} label="Path lessons completed" />
          <StatCard
            icon="🔥"
            value={String(streak)}
            label={streak === 1 ? "Day streak" : "Days streak"}
            sub={best > streak ? `Best: ${best}` : undefined}
          />
        </div>

        {/* Last 7 days */}
        <div style={{ ...card, marginBottom: "2rem" }}>
          <h3 style={{ color: colors.textPrimary, margin: "0 0 1rem 0" }}>Last 7 days</h3>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", marginBottom: "1rem" }}>
            {week.map(({ day, active }) => {
              const [y, m, d] = day.split("-").map(Number);
              const date = new Date(y, m - 1, d);
              return (
                <div key={day} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ color: colors.textSecondary, fontSize: "0.8rem", marginBottom: "0.4rem" }}>
                    {date.toLocaleDateString(locale, { weekday: "short" })}
                  </div>
                  <div
                    title={formatDay(day, locale)}
                    style={{
                      width: 36,
                      height: 36,
                      margin: "0 auto",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      background: active ? colors.secondary : colors.background,
                      color: active ? "white" : colors.textSecondary,
                      border: `2px solid ${active ? colors.secondary : colors.border}`,
                    }}
                  >
                    {d}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ color: colors.textSecondary, margin: 0, fontSize: "0.9rem" }}>
            {lastDay ? `Last study: ${formatDay(lastDay, locale)}` : "No study sessions yet. Answer a question to start your streak!"}
          </p>
        </div>

        {/* Category Breakdown */}
        <div style={{ ...card, marginBottom: "2rem" }}>
          <h3 style={{ color: colors.textPrimary, margin: "0 0 1.5rem 0" }}>Words learned by category</h3>

          {byCategory.length === 0 ? (
            <p style={{ color: colors.textSecondary, margin: 0 }}>No category data available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {byCategory.map((c) => (
                <div key={c.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ color: colors.textPrimary, fontWeight: "500" }}>{c.name}</span>
                    <span style={{ color: colors.textSecondary, fontSize: "0.9rem" }}>
                      {c.learned} / {c.total} ({c.percentage}%)
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
                        width: `${c.percentage}%`,
                        height: "100%",
                        background: c.color,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
