import React, { useState } from "react";
import type { FieldError } from "react-hook-form";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, type, className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={props.id ?? props.name}
          style={{
            fontSize: "0.75rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: error
              ? "var(--color-error)"
              : "var(--color-text-secondary)",
            fontFamily: "var(--font-display)",
          }}
        >
          {label}
        </label>

        <div style={{ position: "relative" }}>
          <input
            ref={ref}
            id={props.id ?? props.name}
            type={inputType}
            {...props}
            style={{
              width: "100%",
              padding: isPassword ? "0.75rem 3rem 0.75rem 1rem" : "0.75rem 1rem",
              background: "var(--color-surface-2)",
              border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: "0.9375rem",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
              ...props.style,
            }}
            className={`input-field ${className}`}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error
                ? "var(--color-error)"
                : "var(--color-accent)";
              e.currentTarget.style.boxShadow = error
                ? "0 0 0 3px rgba(248, 113, 113, 0.12)"
                : "0 0 0 3px var(--color-accent-muted)";
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error
                ? "var(--color-error)"
                : "var(--color-border)";
              e.currentTarget.style.boxShadow = "none";
              props.onBlur?.(e);
            }}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute",
                right: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                padding: "0",
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-muted)";
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>

        {(error || hint) && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: error ? "var(--color-error)" : "var(--color-text-muted)",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {error?.message ?? hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
