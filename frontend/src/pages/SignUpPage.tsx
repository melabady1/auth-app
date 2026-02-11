import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useWatch } from "react-hook-form";

import { signUpSchema, type SignUpFormData } from "@/lib/schemas";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/AuthLayout";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { PasswordStrength } from "@/components/PasswordStrength";

export function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
  });

  const passwordValue = useWatch({ control, name: "password", defaultValue: "" });

  const onSubmit = async (data: SignUpFormData) => {
    const result = await signUp(data);
    if (result.success) {
      toast.success("Account created! Welcome aboard 🎉");
      navigate("/app");
    } else {
      toast.error(result.error ?? "Sign up failed. Please try again.");
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
              New Account
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
            Create your account
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.9375rem",
              margin: "0.625rem 0 0",
              lineHeight: 1.6,
            }}
          >
            Already have one?{" "}
            <Link
              to="/signin"
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
              Sign in instead
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
            label="Name"
            type="text"
            placeholder="Jane Doe"
            error={errors.name}
            autoComplete="name"
            {...register("name")}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              error={errors.password}
              autoComplete="new-password"
              {...register("password")}
            />
            <PasswordStrength password={passwordValue} />
          </div>

          <div style={{ paddingTop: "0.25rem" }}>
            <Button type="submit" fullWidth isLoading={isLoading}>
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
          </div>
        </form>

        {/* Footer note */}
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-text-muted)",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </AuthLayout>
  );
}
