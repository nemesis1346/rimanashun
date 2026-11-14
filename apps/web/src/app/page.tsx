"use client";

import React from "react";
import Layout from "@/components/Layout";
import LearningPath from "@/components/LearningPath";
import { colors } from "@/lib/colors";
import { fetchCategories, Category } from "@/lib/data";
import { useLanguage } from "@/lib/language";
import { getLearned, onProgressChanged } from "@/lib/progress";
import { buildPath, LESSONS_PER_UNIT } from "@/lib/path";

export default function HomePage() {
  const { language } = useLanguage();
  const [categories, setCategories] = React.useState<Category[] | null>(null);
  const [completed, setCompleted] = React.useState<string[]>([]);

  // Re-read after a sync pulls in lessons completed on another device
  React.useEffect(
    () => onProgressChanged(() => setCompleted(getLearned("completedLessons"))),
    []
  );

  React.useEffect(() => {
    setCompleted(getLearned("completedLessons"));
    fetchCategories(language).then(setCategories);
  }, [language]);

  if (!categories) {
    return (
      <Layout>
        <div key="home-loading" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: colors.textSecondary }}>Loading...</p>
        </div>
      </Layout>
    );
  }

  const units = buildPath(categories, completed);
  const total = categories.length * LESSONS_PER_UNIT;
  const done = units.flatMap((u) => u.nodes).filter((n) => n.state === "completed").length;

  return (
    <Layout>
      <div key="home-path">
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto 1.5rem auto",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <h2 style={{ color: colors.textPrimary, fontSize: "1.5rem", flexShrink: 0 }}>
            ¡Alli puncha!
          </h2>
          <div
            style={{
              flex: 1,
              height: 14,
              background: "#E2E8F0",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(done / total) * 100}%`,
                height: "100%",
                background: colors.secondary,
                borderRadius: 999,
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <span style={{ color: colors.textSecondary, fontWeight: 700, fontSize: 14 }}>
            {done}/{total}
          </span>
        </div>
        <LearningPath units={units} />
      </div>
    </Layout>
  );
}
