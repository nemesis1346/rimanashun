import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>404 – Page Not Found</h1>
      <p style={{ marginBottom: "2rem", color: "#666" }}>
        The page you are looking for does not exist.
      </p>
      <Link href="/" style={{ color: "#4f46e5", textDecoration: "underline" }}>
        Go back home
      </Link>
    </div>
  );
}
