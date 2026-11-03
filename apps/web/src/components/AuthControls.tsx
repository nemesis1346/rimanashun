"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language";
import { uiStrings } from "@rimanashun/shared";

const linkStyle: React.CSSProperties = {
  padding: "0.4rem 0.6rem",
  border: "1px solid rgba(255,255,255,0.6)",
  borderRadius: "8px",
  color: "white",
  fontSize: "0.85rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

// Plain <a> tags on purpose: /auth/* are server redirects, not client routes.
export default function AuthControls() {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const { language } = useLanguage();

  if (isLoading) return null;

  if (!user) {
    return (
      <a href={`/auth/login?returnTo=${encodeURIComponent(pathname ?? "/")}`} style={linkStyle}>
        {uiStrings[language].auth.logIn}
      </a>
    );
  }

  return (
    <>
      <span className="header-user" style={{ fontSize: "0.85rem", opacity: 0.9 }}>
        {user.name ?? user.email}
      </span>
      <a href="/auth/logout" style={linkStyle}>
        {uiStrings[language].auth.logOut}
      </a>
    </>
  );
}
