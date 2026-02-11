import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left panel – decorative */}
      <div
        style={{
          flex: "0 0 42%",
          background: "var(--color-surface)",
          display: "none",
          position: "relative",
          overflow: "hidden",
          borderRight: "1px solid var(--color-border)",
        }}
        className="lg-panel"
      >
        {/* Glow blob */}
        <div
          style={{
            position: "absolute",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124, 111, 255, 0.18) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />

        {/* Geometric grid */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.06,
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Logo & tagline */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "3rem",
            gap: "2rem",
          }}
        >
          <div className="animate-float" style={{ textAlign: "center" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "22px",
                background: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                boxShadow: "0 0 40px var(--color-accent-glow)",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--color-text-primary)",
                margin: 0,
                letterSpacing: "-0.03em",
              }}
            >
              Auth App
            </h1>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "1rem",
                margin: "0.75rem 0 0",
                lineHeight: 1.6,
                maxWidth: "260px",
              }}
            >
              Secure authentication built for modern applications.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "260px" }}>
            {[
              { icon: "🔐", text: "End-to-end encryption" },
              { icon: "⚡", text: "Lightning fast" },
              { icon: "🛡️", text: "Production-ready security" },
            ].map((item) => (
              <div
                key={item.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  background: "var(--color-surface-2)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                <span style={{ fontSize: "1.125rem" }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
          position: "relative",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124, 111, 255, 0.06) 0%, transparent 65%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {children}
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-panel {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
