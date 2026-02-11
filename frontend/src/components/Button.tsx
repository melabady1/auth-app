import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "ghost";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading,
  variant = "primary",
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const isPrimary = variant === "primary";
  const isDisabled = disabled ?? isLoading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        width: fullWidth ? "100%" : undefined,
        padding: "0.8125rem 1.75rem",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-display)",
        fontSize: "0.9375rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        cursor: isDisabled ? "not-allowed" : "pointer",
        border: isPrimary ? "none" : "1px solid var(--color-border)",
        background: isPrimary
          ? isDisabled
            ? "var(--color-border)"
            : "var(--color-accent)"
          : "transparent",
        color: isPrimary
          ? isDisabled
            ? "var(--color-text-muted)"
            : "#fff"
          : "var(--color-text-secondary)",
        opacity: isDisabled && !isLoading ? 0.6 : 1,
        transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
        boxShadow: isPrimary && !isDisabled
          ? "0 4px 20px var(--color-accent-glow)"
          : "none",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          if (isPrimary) {
            e.currentTarget.style.background = "var(--color-accent-hover)";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 8px 30px var(--color-accent-glow)";
          } else {
            e.currentTarget.style.borderColor = "var(--color-border-hover)";
            e.currentTarget.style.color = "var(--color-text-primary)";
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          if (isPrimary) {
            e.currentTarget.style.background = "var(--color-accent)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px var(--color-accent-glow)";
          } else {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.color = "var(--color-text-secondary)";
          }
        }
      }}
      onMouseDown={(e) => {
        if (!isDisabled && isPrimary) {
          e.currentTarget.style.transform = "translateY(0px) scale(0.98)";
        }
      }}
      onMouseUp={(e) => {
        if (!isDisabled && isPrimary) {
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
    >
      {isLoading && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{
            animation: "spin 0.8s linear infinite",
          }}
        >
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      )}
      {children}
    </button>
  );
};
