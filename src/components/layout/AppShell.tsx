export function AppShell() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 24px",
      }}
    >
      <section
        style={{
          width: "min(920px, 100%)",
          borderRadius: "28px",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          boxShadow: "var(--shadow)",
          backdropFilter: "blur(12px)",
          padding: "40px",
        }}
      >
        <p
          style={{
            margin: 0,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--accent)",
            fontSize: "0.82rem",
          }}
        >
          Shared research workspace
        </p>
        <h1
          style={{
            margin: "16px 0 12px",
            fontSize: "clamp(2.6rem, 7vw, 4.8rem)",
            lineHeight: 0.96,
          }}
        >
          TeXquill
        </h1>
        <p
          style={{
            margin: 0,
            maxWidth: "42rem",
            color: "var(--muted)",
            fontSize: "1.1rem",
            lineHeight: 1.7,
          }}
        >
          Paper-ready tables from shared experiment results, built for fast review,
          precise iteration, and deterministic LaTeX export.
        </p>
      </section>
    </main>
  );
}
