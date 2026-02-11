interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements: Requirement[] = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "One letter", met: /[a-zA-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password) },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const strength = metCount === 0 ? 0 : metCount <= 2 ? 1 : metCount === 3 ? 2 : 3;

  const strengthLabels = ["", "Weak", "Fair", "Strong"];
  const strengthColors = [
    "var(--color-border)",
    "var(--color-error)",
    "var(--color-warning)",
    "var(--color-success)",
  ];

  if (!password) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      {/* Strength bar */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            style={{
              flex: 1,
              height: "3px",
              borderRadius: "2px",
              background:
                strength >= level ? strengthColors[strength] : "var(--color-border)",
              transition: "background 0.3s ease",
            }}
          />
        ))}
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: strengthColors[strength],
            fontFamily: "var(--font-display)",
            minWidth: "3.5rem",
            textAlign: "right",
          }}
        >
          {strengthLabels[strength]}
        </span>
      </div>

      {/* Requirements */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
        {requirements.map((req) => (
          <span
            key={req.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.75rem",
              color: req.met ? "var(--color-success)" : "var(--color-text-muted)",
              transition: "color 0.2s",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              {req.met ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <circle cx="12" cy="12" r="9" />
              )}
            </svg>
            {req.label}
          </span>
        ))}
      </div>
    </div>
  );
}
