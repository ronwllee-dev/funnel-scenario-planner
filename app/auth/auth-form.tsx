"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";

type AuthMode = "login" | "signup" | "forgot" | "reset";

const copy: Record<
  AuthMode,
  {
    title: string;
    subtitle: string;
    button: string;
    endpoint: string;
    successRedirect?: string;
  }
> = {
  login: {
    title: "Log in",
    subtitle: "Open your private scenario workspace.",
    button: "Log in",
    endpoint: "/api/auth/login",
    successRedirect: "/",
  },
  signup: {
    title: "Create account",
    subtitle: "Start saving private funnel scenarios.",
    button: "Create account",
    endpoint: "/api/auth/signup",
    successRedirect: "/",
  },
  forgot: {
    title: "Reset password",
    subtitle: "Send a password reset link to your email.",
    button: "Send reset link",
    endpoint: "/api/auth/forgot-password",
  },
  reset: {
    title: "Choose new password",
    subtitle: "Set a new password for this account.",
    button: "Update password",
    endpoint: "/api/auth/reset-password",
    successRedirect: "/auth/login",
  },
};

export default function AuthForm({
  mode,
  configMessage,
}: {
  mode: AuthMode;
  configMessage?: string;
}) {
  const [message, setMessage] = useState(configMessage ?? "");
  const [loading, setLoading] = useState(false);
  const showEmail = mode !== "reset";
  const showPassword = mode !== "forgot";
  const details = copy[mode];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch(details.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "Something went wrong.");
      return;
    }

    if (details.successRedirect && data.redirect !== false) {
      window.location.href = details.successRedirect;
      return;
    }

    setMessage(data.message ?? "Request completed.");
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Funnel Scenario Planner</p>
        <h1>{details.title}</h1>
        <p>{details.subtitle}</p>
        <form className="auth-form" onSubmit={onSubmit}>
          {showEmail ? (
            <label>
              Email
              <input
                autoComplete="email"
                disabled={Boolean(configMessage)}
                name="email"
                required
                type="email"
              />
            </label>
          ) : null}
          {showPassword ? (
            <label>
              Password
              <input
                autoComplete={mode === "reset" ? "new-password" : "current-password"}
                disabled={Boolean(configMessage)}
                minLength={8}
                name="password"
                required
                type="password"
              />
            </label>
          ) : null}
          <button className="button primary" disabled={loading || Boolean(configMessage)}>
            {loading ? "Working..." : details.button}
          </button>
        </form>
        {message ? <div className="auth-message">{message}</div> : null}
        <nav className="auth-links" aria-label="Authentication links">
          {mode !== "login" ? <Link href="/auth/login">Log in</Link> : null}
          {mode !== "signup" ? <Link href="/auth/signup">Create account</Link> : null}
          {mode !== "forgot" && mode !== "reset" ? (
            <Link href="/auth/forgot-password">Forgot password?</Link>
          ) : null}
        </nav>
      </section>
    </main>
  );
}
