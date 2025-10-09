"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { colors } from "@/lib/colors";
import { fetchVocabulary, fetchPuzzles, KichwaWord } from "@/lib/data";

interface ProgressStats {
  totalWords: number;
  totalPuzzles: number;
  categoriesStudied: number;
  studyStreak: number;
  lastStudyDate: string;
  learnedWords: number;
  learnedPuzzles: number;
}

export default function ProgressPage() {
  const [words, setWords] = useState<KichwaWord[]>([]);
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    totalWords: 0,
    totalPuzzles: 0,
    categoriesStudied: 0,
    studyStreak: 0,
    lastStudyDate: "",
    learnedWords: 0,
    learnedPuzzles: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vocabData, puzzleData] = await Promise.all([
          fetchVocabulary(),
          fetchPuzzles(),
        ]);

        setWords(vocabData);
        setPuzzles(puzzleData);

        // Calculate stats
        const uniqueCategories = new Set(
          vocabData.map((word) => word.category || "general")
        );

        // Read learned progress from localStorage if present
        const getLearnedCount = (key: string) => {
          try {
            const raw = localStorage.getItem(key);
            if (!raw) return 0;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.length;
            const n = parseInt(String(parsed), 10);
            return Number.isFinite(n) ? n : 0;
          } catch {
            return 0;
          }
        };

        const learnedWords = getLearnedCount("learnedWords");
        const learnedPuzzles = getLearnedCount("learnedPuzzles");

        // Mock remaining stats (e.g. streak)
        const mockStats: ProgressStats = {
          totalWords: vocabData.length,
          totalPuzzles: puzzleData.length,
          categoriesStudied: uniqueCategories.size,
          studyStreak: 7, // Mock streak
          lastStudyDate: new Date().toLocaleDateString(),
          learnedWords,
          learnedPuzzles,
        };

        setStats(mockStats);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getCategoryStats = () => {
    const categoryMap = new Map<string, number>();

    words.forEach((word) => {
      const category = word.category || "general";
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      percentage:
        words.length > 0 ? Math.round((count / words.length) * 100) : 0,
    }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: colors.textSecondary }}>Loading progress...</p>
        </div>
      </Layout>
    );
  }

  const categoryStats = getCategoryStats();

  return (
    <Layout>
      <div>
        <h2 style={{ color: colors.textPrimary, marginBottom: "2rem" }}>
          Progress
        </h2>

        {/* Overview Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📚</div>
            <h3 style={{ color: colors.textPrimary, margin: "0 0 0.5rem 0" }}>
              {stats.learnedWords} / {stats.totalWords}
            </h3>
            <p
              style={{
                color: colors.textSecondary,
                margin: 0,
                fontSize: "0.9rem",
              }}
            >
              Total Words
            </p>
          </div>

          <div
            style={{
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🧩</div>
            <h3 style={{ color: colors.textPrimary, margin: "0 0 0.5rem 0" }}>
              {stats.learnedPuzzles} / {stats.totalPuzzles}
            </h3>
            <p
              style={{
                color: colors.textSecondary,
                margin: 0,
                fontSize: "0.9rem",
              }}
            >
              Sentence Puzzles
            </p>
          </div>

          <div
            style={{
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
            <h3 style={{ color: colors.textPrimary, margin: "0 0 0.5rem 0" }}>
              {stats.categoriesStudied}
            </h3>
            <p
              style={{
                color: colors.textSecondary,
                margin: 0,
                fontSize: "0.9rem",
              }}
            >
              Categories
            </p>
          </div>

          <div
            style={{
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔥</div>
            <h3 style={{ color: colors.textPrimary, margin: "0 0 0.5rem 0" }}>
              {stats.studyStreak}
            </h3>
            <p
              style={{
                color: colors.textSecondary,
                margin: 0,
                fontSize: "0.9rem",
              }}
            >
              Day Streak
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div
          style={{
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ color: colors.textPrimary, margin: "0 0 1.5rem 0" }}>
            Category Breakdown
          </h3>

          {categoryStats.length === 0 ? (
            <p style={{ color: colors.textSecondary, margin: 0 }}>
              No category data available.
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {categoryStats.map((category, index) => (
                <div key={index}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{ color: colors.textPrimary, fontWeight: "500" }}
                    >
                      {category.name}
                    </span>
                    <span
                      style={{
                        color: colors.textSecondary,
                        fontSize: "0.9rem",
                      }}
                    >
                      {category.count} words ({category.percentage}%)
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
                        width: `${category.percentage}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${colors.primaryGradient[0]}, ${colors.primaryGradient[1]})`,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Study Activity */}
        <div
          style={{
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ color: colors.textPrimary, margin: "0 0 1.5rem 0" }}>
            Recent Activity
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "1rem",
                backgroundColor: colors.background,
                borderRadius: "8px",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginRight: "1rem" }}>📚</div>
              <div>
                <p
                  style={{
                    color: colors.textPrimary,
                    margin: "0 0 0.25rem 0",
                    fontWeight: "500",
                  }}
                >
                  Studied Flashcards
                </p>
                <p
                  style={{
                    color: colors.textSecondary,
                    margin: 0,
                    fontSize: "0.9rem",
                  }}
                >
                  Last study: {stats.lastStudyDate}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "1rem",
                backgroundColor: colors.background,
                borderRadius: "8px",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginRight: "1rem" }}>❓</div>
              <div>
                <p
                  style={{
                    color: colors.textPrimary,
                    margin: "0 0 0.25rem 0",
                    fontWeight: "500",
                  }}
                >
                  Completed Quiz
                </p>
                <p
                  style={{
                    color: colors.textSecondary,
                    margin: 0,
                    fontSize: "0.9rem",
                  }}
                >
                  Score: 85% (Mock data)
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "1rem",
                backgroundColor: colors.background,
                borderRadius: "8px",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginRight: "1rem" }}>🧩</div>
              <div>
                <p
                  style={{
                    color: colors.textPrimary,
                    margin: "0 0 0.25rem 0",
                    fontWeight: "500",
                  }}
                >
                  Solved Sentence Puzzle
                </p>
                <p
                  style={{
                    color: colors.textSecondary,
                    margin: 0,
                    fontSize: "0.9rem",
                  }}
                >
                  "Ñuka yaku upini" - Correct!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div
          style={{
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            padding: "1.5rem",
          }}
        >
          <h3 style={{ color: colors.textPrimary, margin: "0 0 1.5rem 0" }}>
            Achievements
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                backgroundColor: colors.background,
                borderRadius: "8px",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎯</div>
              <p
                style={{
                  color: colors.textPrimary,
                  margin: "0 0 0.25rem 0",
                  fontWeight: "500",
                }}
              >
                First Steps
              </p>
              <p
                style={{
                  color: colors.textSecondary,
                  margin: 0,
                  fontSize: "0.8rem",
                }}
              >
                Complete your first lesson
              </p>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                backgroundColor: colors.background,
                borderRadius: "8px",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔥</div>
              <p
                style={{
                  color: colors.textPrimary,
                  margin: "0 0 0.25rem 0",
                  fontWeight: "500",
                }}
              >
                Streak Master
              </p>
              <p
                style={{
                  color: colors.textSecondary,
                  margin: 0,
                  fontSize: "0.8rem",
                }}
              >
                7 day study streak
              </p>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                backgroundColor: colors.background,
                borderRadius: "8px",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🧩</div>
              <p
                style={{
                  color: colors.textPrimary,
                  margin: "0 0 0.25rem 0",
                  fontWeight: "500",
                }}
              >
                Puzzle Solver
              </p>
              <p
                style={{
                  color: colors.textSecondary,
                  margin: 0,
                  fontSize: "0.8rem",
                }}
              >
                Complete sentence puzzles
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
