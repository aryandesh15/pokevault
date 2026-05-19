import { useState } from "react";
import type { AppUser } from "../types";

type AuthMode = "login" | "signup";

type AuthPageProps = {
  setCurrentUser: (user: AppUser) => void;
  setAuthToken: (token: string) => void;
  setFavoriteIds: (ids: number[]) => void;
  setActivePage: (page: "home" | "favorites" | "battle" | "auth") => void;
};

type AuthResponse = {
  message: string;
  token: string;
  user: AppUser;
};

function AuthPage({
  setCurrentUser,
  setAuthToken,
  setFavoriteIds,
  setActivePage,
}: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const endpoint = mode === "signup" ? "/api/auth-signup" : "/api/auth-login";

      const body =
        mode === "signup"
          ? { name, email, password }
          : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage(data.message || "Authentication failed.");
        return;
      }

      const authData = data as AuthResponse;

      localStorage.setItem("pokevaultToken", authData.token);
      localStorage.setItem("pokevaultUser", JSON.stringify(authData.user));

      setAuthToken(authData.token);
      setCurrentUser(authData.user);
      setFavoriteIds(authData.user.favoritePokemonIds || []);
      setActivePage("home");
    } catch (error) {
      console.error("Auth error:", error);
      setStatusMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setStatusMessage("");
    setName("");
    setEmail("");
    setPassword("");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-copy">
          <p className="eyebrow">PokéVault Account</p>
          <h2>{mode === "login" ? "Welcome back." : "Create your trainer account."}</h2>
          <p>
            Sign in to save favorite Pokémon to MongoDB and keep your collection
            synced to your account.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-toggle">
            <button
              type="button"
              className={mode === "login" ? "auth-toggle-button active" : "auth-toggle-button"}
              onClick={() => switchMode("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={mode === "signup" ? "auth-toggle-button active" : "auth-toggle-button"}
              onClick={() => switchMode("signup")}
            >
              Sign Up
            </button>
          </div>

          {mode === "signup" && (
            <div className="auth-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Ash Ketchum"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="trainer@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {statusMessage && <p className="auth-message">{statusMessage}</p>}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;