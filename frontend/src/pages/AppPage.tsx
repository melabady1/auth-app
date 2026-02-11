import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";

export function AppPage() {
  const navigate = useNavigate();
  const { signOut, getUser } = useAuth();
  const user = getUser();

  const handleLogout = async () => {
    await signOut();
    toast.info("You've been signed out.");
    navigate("/signin");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background elements */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124, 111, 255, 0.07) 0%, transparent 65%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        {/* Grid */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.025 }}
        >
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Top nav */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          padding: "1.25rem 2rem",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(10, 10, 15, 0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px var(--color-accent-glow)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.0625rem",
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Auth App
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Avatar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.375rem 0.875rem 0.375rem 0.5rem",
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "999px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.6875rem",
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                color: "white",
              }}
            >
              {initials}
            </div>
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                fontWeight: 500,
              }}
            >
              {user?.name ?? "User"}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 1rem",
              background: "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-error)";
              e.currentTarget.style.color = "var(--color-error)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-text-secondary)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main
        className="animate-fade-in-up"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          position: "relative",
          zIndex: 1,
          gap: "2.5rem",
        }}
      >
        {/* Status badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            background: "rgba(74, 222, 128, 0.08)",
            border: "1px solid rgba(74, 222, 128, 0.2)",
            borderRadius: "999px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--color-success)",
              boxShadow: "0 0 8px rgba(74, 222, 128, 0.6)",
            }}
          />
          <span
            style={{
              fontSize: "0.8125rem",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-success)",
            }}
          >
            Authenticated
          </span>
        </div>

        {/* Welcome message */}
        <div style={{ textAlign: "center", maxWidth: "520px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              margin: 0,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            Welcome to the{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--color-accent) 0%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              application.
            </span>
          </h1>

          {user && (
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "1.0625rem",
                margin: "1rem 0 0",
                lineHeight: 1.6,
              }}
            >
              Good to see you, <strong style={{ color: "var(--color-text-primary)" }}>{user.name}</strong>.
              You're successfully signed in as{" "}
              <span style={{ color: "var(--color-accent)" }}>{user.email}</span>.
            </p>
          )}
        </div>

        {/* Info card */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
            width: "100%",
            maxWidth: "520px",
          }}
        >
          {[
            { label: "Status", value: "Active", color: "var(--color-success)" },
            { label: "Session", value: "Secure", color: "var(--color-accent)" },
            { label: "Role", value: "Member", color: "var(--color-warning)" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: "1.25rem",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "1.125rem",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  color: item.color,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
