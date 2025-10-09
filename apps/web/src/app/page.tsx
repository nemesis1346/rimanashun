"use client";

import React from "react";
import Link from "next/link";
import { fetchVocabulary, fetchPuzzles } from "@/lib/data";
import Layout from "@/components/Layout";
import { colors } from "@/lib/colors";

export default function HomePage() {
  const [vocabCount, setVocabCount] = React.useState<number>(0);
  const [puzzleCount, setPuzzleCount] = React.useState<number>(0);
  React.useEffect(() => {
    (async () => {
      const [v, p] = await Promise.all([fetchVocabulary(), fetchPuzzles()]);
      setVocabCount(v.length);
      setPuzzleCount(p.length);
    })();
  }, []);

  const quickActions = [
    {
      title: "Flashcards",
      subtitle: "Learn with cards",
      icon: "🃏",
      href: "/flashcards",
      color: colors.primary,
    },
    {
      title: "Quiz",
      subtitle: "Test your knowledge",
      icon: "❓",
      href: "/quiz",
      color: colors.secondary,
    },
    {
      title: "Categories",
      subtitle: "Browse by topic",
      icon: "📚",
      href: "/categories",
      color: colors.accent,
    },
    {
      title: "Sentence Puzzle",
      subtitle: "Arrange sentences",
      icon: "🧩",
      href: "/sentence-puzzle",
      color: colors.primary,
    },
  ];

  return (
    <Layout>
      <div>
        {/* Welcome Section */}
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.primaryGradient[0]}, ${colors.primaryGradient[1]})`,
            color: "white",
            padding: "2rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem" }}>
            ¡Alli puncha!
          </h2>
          <p style={{ margin: "0 0 1rem 0", opacity: 0.9, fontSize: "1.1rem" }}>
            Welcome to Kichwa Learning
          </p>
          <p style={{ margin: 0, opacity: 0.8 }}>
            {vocabCount} words available • {puzzleCount} sentence puzzles
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: colors.textPrimary, marginBottom: "1rem" }}>
            Quick Start
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
            }}
          >
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${action.color}, ${action.color}80)`,
                    color: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    textAlign: "center",
                    transition: "transform 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                    {action.icon}
                  </div>
                  <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>
                    {action.title}
                  </h4>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: "0.9rem" }}>
                    {action.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Daily Challenge */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: colors.textPrimary, marginBottom: "1rem" }}>
            Daily Challenge
          </h3>
          <Link
            href="/quiz"
            style={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg, ${colors.accentGradient[0]}, ${colors.accentGradient[1]})`,
                color: "white",
                padding: "1.5rem",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: "1.5rem", marginRight: "1rem" }}>
                🏆
              </span>
              <div>
                <h4 style={{ margin: "0 0 0.5rem 0" }}>
                  Complete today's quiz
                </h4>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  Maintain your learning streak!
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Learning Tips */}
        <div>
          <h3 style={{ color: colors.textPrimary, marginBottom: "1rem" }}>
            Learning Tips
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {[
              "Practice flashcards daily to reinforce your memory",
              "Take short 5-minute sessions for better retention",
              "Review difficult words more frequently",
            ].map((tip, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: colors.cardBackground,
                  padding: "1rem",
                  borderRadius: "8px",
                  border: `1px solid ${colors.border}`,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: "0.75rem", color: colors.primary }}>
                  💡
                </span>
                <span style={{ color: colors.textPrimary }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
