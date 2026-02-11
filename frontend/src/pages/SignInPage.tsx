import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { signInSchema, type SignInFormData } from "@/lib/schemas";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/AuthLayout";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export function SignInPage() {
  const navigate = useNavigate();
  const { signIn, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: SignInFormData) => {
    const result = await signIn(data);
    if (result.success) {
      toast.success("Welcome back! 👋");
      navigate("/app");
    } else {
      toast.error(result.error ?? "Sign in failed. Please check your credentials.");
    }
  };

  return (
    <AuthLayout>
      <div
        className="animate-fade-in-up"
        style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
      >
        {/* Header */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.375rem 0.875rem",
              background: "var(--color-accent-muted)",
              borderRadius: "999px",
              border: "1px solid rgba(124, 111, 255, 0.2)",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--color-accent)",
                animation: "pulse-glow 2s ease infinite",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
              }}
            >
              Welcome back
            </span>
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              margin: 0,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            Sign in to your account
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.9375rem",
              margin: "0.625rem 0 0",
              lineHeight: 1.6,
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: "var(--color-accent)",
                textDecoration: "none",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          noValidate
        >
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email}
            autoComplete="email"
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            error={errors.password}
            autoComplete="current-password"
            {...register("password")}
          />

          <div style={{ paddingTop: "0.25rem" }}>
            <Button type="submit" fullWidth isLoading={isLoading}>
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            color: "var(--color-text-muted)",
            fontSize: "0.8125rem",
          }}
        >
        </div>
      </div>
    </AuthLayout>
  );
}
