"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { colors } from "@/lib/colors";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/categories", label: "Categories", icon: "📚" },
    { href: "/flashcards", label: "Flashcards", icon: "🃏" },
    { href: "/quiz", label: "Quiz", icon: "❓" },
    { href: "/sentence-puzzle", label: "Puzzle", icon: "🧩" },
    { href: "/progress", label: "Progress", icon: "📊" },
  ];

  return (
    <>
      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-menu {
            display: block !important;
          }
          .main-content {
            padding: 1rem !important;
          }
          .header-content {
            padding: 1rem !important;
          }
          .header-title {
            font-size: 1.25rem !important;
          }
          .header-subtitle {
            font-size: 0.9rem !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
          .desktop-sidebar {
            display: block !important;
          }
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 40;
        }

        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          background: ${colors.cardBackground};
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          overflow-y: auto;
        }

        .mobile-sidebar.open {
          transform: translateX(0);
        }
      `}</style>

      <div style={{ minHeight: "100vh", backgroundColor: colors.background }}>
        {/* Header */}
        <header
          style={{
            background: `linear-gradient(135deg, ${colors.primaryGradient[0]}, ${colors.primaryGradient[1]})`,
            color: "white",
            padding: "1rem 2rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            position: "relative",
            zIndex: 30,
          }}
        >
          <div
            className="header-content"
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1
                className="header-title"
                style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold" }}
              >
                Kichwa Learning
              </h1>
              <p
                className="header-subtitle"
                style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}
              >
                Learn Kichwa (Otavalo) - Web Version
              </p>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: "none",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "1.5rem",
                cursor: "pointer",
                padding: "0.5rem",
              }}
            >
              ☰
            </button>
          </div>
        </header>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="mobile-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <nav className={`mobile-sidebar ${isMobileMenuOpen ? "open" : ""}`}>
          <div style={{ padding: "2rem 1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: colors.textPrimary,
                  fontSize: "1.2rem",
                }}
              >
                Menu
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: colors.textSecondary,
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}
              >
                ✕
              </button>
            </div>

            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.75rem 1rem",
                    marginBottom: "0.5rem",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: isActive ? "white" : colors.textPrimary,
                    backgroundColor: isActive ? colors.primary : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ marginRight: "0.75rem", fontSize: "1.2rem" }}>
                    {item.icon}
                  </span>
                  <span style={{ fontWeight: isActive ? "600" : "400" }}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div style={{ display: "flex", maxWidth: "1200px", margin: "0 auto" }}>
          {/* Desktop Sidebar Navigation */}
          <nav
            className="desktop-sidebar"
            style={{
              width: "250px",
              backgroundColor: colors.cardBackground,
              borderRight: `1px solid ${colors.border}`,
              padding: "2rem 0",
              minHeight: "calc(100vh - 120px)",
            }}
          >
            <div style={{ padding: "0 1rem" }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0.75rem 1rem",
                      marginBottom: "0.5rem",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: isActive ? "white" : colors.textPrimary,
                      backgroundColor: isActive
                        ? colors.primary
                        : "transparent",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span
                      style={{ marginRight: "0.75rem", fontSize: "1.2rem" }}
                    >
                      {item.icon}
                    </span>
                    <span style={{ fontWeight: isActive ? "600" : "400" }}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Main Content */}
          <main
            className="main-content"
            style={{
              flex: 1,
              padding: "2rem",
              backgroundColor: colors.background,
              minHeight: "calc(100vh - 120px)",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
