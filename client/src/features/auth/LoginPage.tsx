import { useState } from "react";
import type { User } from "../../shared/types/auth";

type LoginPageProps = {
  onAuthenticated: (user: User) => void;
};

type AuthMode = "login" | "signup";

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { user?: User; error?: string };

      if (!response.ok || !data.user) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      onAuthenticated(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-mark">JS</div>
        <h1>Job Search Studio</h1>
        <p>{isSignup ? "Create an account to get started." : "Log in to your account."}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            Password
            <input
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={isSignup ? 8 : undefined}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {isSignup && (
            <label>
              Confirm password
              <input
                autoComplete="new-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                value={confirmPassword}
              />
            </label>
          )}

          {error && <small className="field-error">{error}</small>}

          <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Please wait..." : isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            className="link-button"
            onClick={() => switchMode(isSignup ? "login" : "signup")}
            type="button"
          >
            {isSignup ? "Log in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}
