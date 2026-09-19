"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { colors } from "@/lib/colors";
import { fetchVocabulary, fetchCategories, Category as ApiCategory } from "@/lib/data";
import { useLanguage } from "@/lib/language";

interface Category extends ApiCategory {
  wordCount: number;
}

// The backend stores Ionicons names (shared with native); web renders a
// plain emoji instead of pulling in an icon library for this one page.
const ICON_EMOJI: { [ioniconsName: string]: string } = {
  calculator: "🔢",
  "color-palette": "🎨",
  people: "👪",
  restaurant: "🍽️",
  paw: "🐾",
  body: "🧍",
  leaf: "🌿",
  home: "🏠",
  walk: "🏃",
  chatbubbles: "💬",
  apps: "📚",
};

export default function CategoriesPage() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [vocabData, categoryData] = await Promise.all([
          fetchVocabulary(language),
          fetchCategories(language),
        ]);

        const wordCounts = new Map<string, number>();
        vocabData.forEach((word) => {
          wordCounts.set(word.categoryId, (wordCounts.get(word.categoryId) ?? 0) + 1);
        });

        setCategories(
          categoryData.map((category) => ({
            ...category,
            wordCount: wordCounts.get(category.id) ?? 0,
          }))
        );
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [language]);

  if (isLoading) {
    return (
      <Layout>
        <div key="categories-loading" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: colors.textSecondary }}>Loading categories...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div key="categories-active">
        <h2 style={{ color: colors.textPrimary, marginBottom: "2rem" }}>
          Categories
        </h2>

        <p style={{ color: colors.textSecondary, marginBottom: "2rem" }}>
          Browse vocabulary by topic. Each category contains words related to a
          specific theme.
        </p>

        {categories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h3 style={{ color: colors.textPrimary, marginBottom: "1rem" }}>
              No categories available
            </h3>
            <p style={{ color: colors.textSecondary }}>
              Please add vocabulary data with categories to get started.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                style={{
                  backgroundColor: colors.cardBackground,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "16px",
                  padding: "1.5rem",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: `${category.color}20`,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "1rem",
                    }}
                  >
                    <span style={{ fontSize: "2rem" }}>
                      {ICON_EMOJI[category.icon] ?? "📚"}
                    </span>
                  </div>
                  <div>
                    <h3
                      style={{
                        color: colors.textPrimary,
                        margin: "0 0 0.25rem 0",
                        fontSize: "1.25rem",
                        fontWeight: "600",
                      }}
                    >
                      {category.name}
                    </h3>
                    <p
                      style={{
                        color: colors.textSecondary,
                        margin: 0,
                        fontSize: "0.9rem",
                      }}
                    >
                      {category.wordCount} words
                    </p>
                  </div>
                </div>

                <p
                  style={{
                    color: colors.textSecondary,
                    margin: "0 0 1.5rem 0",
                    lineHeight: 1.5,
                  }}
                >
                  {category.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                  }}
                >
                  <Link
                    href={`/flashcards?category=${category.id}`}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      backgroundColor: category.color,
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "8px",
                      textAlign: "center",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Study Flashcards
                  </Link>
                  <Link
                    href={`/quiz?category=${category.id}`}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      backgroundColor: "transparent",
                      color: category.color,
                      textDecoration: "none",
                      border: `2px solid ${category.color}`,
                      borderRadius: "8px",
                      textAlign: "center",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Take Quiz
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

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
            <li>Start with categories that interest you most</li>
            <li>Focus on one category at a time for better retention</li>
            <li>Use flashcards to memorize, then test with quizzes</li>
            <li>Review difficult categories more frequently</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
