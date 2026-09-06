"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { FaSignInAlt, FaGlobe, FaChevronDown, FaGoogle } from "react-icons/fa";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Fetch user location during login
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude.toFixed(4),
            lon: position.coords.longitude.toFixed(4),
            name: `My Field Coordinates (${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)})`
          };
          localStorage.setItem("userLocation", JSON.stringify(coords));
          console.log("User location saved on login:", coords);
        },
        (error) => {
          console.warn("Location access denied or failed during login:", error);
        }
      );
    }
  }, []);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setFormError("Please enter a valid email and password");
      return;
    }

    if (mode === "register" && !trimmedName) {
      setFormError("Please enter your name");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch("/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            password: trimmedPassword,
            location: location.trim() || "Not specified",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "Registration failed. Please try again.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email: trimmedEmail,
        password: trimmedPassword,
        redirect: false,
      });

      if (result?.error) {
        setFormError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(`Error during ${mode}:`, error);
      setFormError(`An error occurred while trying to ${mode}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(145deg, var(--color-bg-page-start), var(--color-bg-page-end))",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-green-800">Loading Fasal Sathi...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          "linear-gradient(145deg, var(--color-bg-page-start), var(--color-bg-page-end))",
        fontFamily: "var(--font-family)",
      }}
    >
      <div className="w-full max-w-105 animate-fade-in">
        {/* Login Card */}
        <div
          className="bg-white px-8 py-10 sm:px-9 sm:py-10 rounded-2xl shadow-lg w-full border"
          style={{
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
            borderColor: "var(--color-border-card)",
            backdropFilter: "blur(2px)",
          }}
        >
          {/* Brand Section */}
          <div className="text-center mb-8">
            <h1
              className="text-[2.2rem] font-bold tracking-tight mt-1"
              style={{
                color: "var(--color-text-green)",
                letterSpacing: "-0.5px",
              }}
            >
              Fasal Sathi
            </h1>
            <p
              className="text-[0.95rem] font-medium tracking-wide inline-block px-6 py-1 rounded-xl mt-1"
              style={{
                color: "var(--color-text-muted)",
                backgroundColor: "var(--color-tagline-bg)",
                borderRadius: "var(--radius-badge)",
                letterSpacing: "0.3px",
              }}
            >
              Crop advisory for farmers
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {formError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  fontSize: "0.85rem",
                }}
              >
                {formError}
              </div>
            )}

            {mode === "register" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="nameInput"
                    className="font-semibold text-[0.95rem]"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    Full Name
                  </label>
                  <div
                    className="flex items-center"
                    style={{
                      border: "1.5px solid var(--color-border-input)",
                      borderRadius: "var(--radius-input)",
                      padding: "0.2rem 0.2rem 0.2rem 1.5rem",
                      backgroundColor: "var(--color-input-bg)",
                    }}
                  >
                    <input
                      type="text"
                      id="nameInput"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required={mode === "register"}
                      className="w-full border-none py-3.5 pr-1 text-base bg-transparent outline-none font-medium tracking-wide"
                      style={{ color: "var(--color-text-muted)" }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="locationInput"
                    className="font-semibold text-[0.95rem]"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    Farm Location (optional)
                  </label>
                  <div
                    className="flex items-center"
                    style={{
                      border: "1.5px solid var(--color-border-input)",
                      borderRadius: "var(--radius-input)",
                      padding: "0.2rem 0.2rem 0.2rem 1.5rem",
                      backgroundColor: "var(--color-input-bg)",
                    }}
                  >
                    <input
                      type="text"
                      id="locationInput"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Palampur, Kangra District"
                      className="w-full border-none py-3.5 pr-1 text-base bg-transparent outline-none font-medium tracking-wide"
                      style={{ color: "var(--color-text-muted)" }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Input Group */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="emailInput"
                className="font-semibold text-[0.95rem] flex items-center gap-2"
                style={{ color: "var(--color-text-body)" }}
              >
                Email Address
              </label>

              <div
                className="flex items-center transition-all duration-200"
                style={{
                  border: "1.5px solid var(--color-border-input)",
                  borderRadius: "var(--radius-input)",
                  padding: "0.2rem 0.2rem 0.2rem 1.5rem",
                  backgroundColor: "var(--color-input-bg)",
                }}
                onFocus={(e) => {
                  const target = e.currentTarget;
                  target.style.borderColor = "var(--color-primary-light)";
                  target.style.boxShadow = "var(--shadow-focus)";
                  target.style.backgroundColor = "var(--color-input-bg-focus)";
                }}
                onBlur={(e) => {
                  const target = e.currentTarget;
                  target.style.borderColor = "var(--color-border-input)";
                  target.style.boxShadow = "none";
                  target.style.backgroundColor = "var(--color-input-bg)";
                }}
              >
                <input
                  type="email"
                  id="emailInput"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  required
                  className="w-full border-none py-3.5 pr-1 text-base bg-transparent outline-none font-medium tracking-wide"
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                />
              </div>
            </div>

            {/* Password Input Group */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="passwordInput"
                className="font-semibold text-[0.95rem] flex items-center gap-2"
                style={{ color: "var(--color-text-body)" }}
              >
                Password
              </label>

              <div
                className="flex items-center transition-all duration-200"
                style={{
                  border: "1.5px solid var(--color-border-input)",
                  borderRadius: "var(--radius-input)",
                  padding: "0.2rem 0.2rem 0.2rem 1.5rem",
                  backgroundColor: "var(--color-input-bg)",
                }}
                onFocus={(e) => {
                  const target = e.currentTarget;
                  target.style.borderColor = "var(--color-primary-light)";
                  target.style.boxShadow = "var(--shadow-focus)";
                  target.style.backgroundColor = "var(--color-input-bg-focus)";
                }}
                onBlur={(e) => {
                  const target = e.currentTarget;
                  target.style.borderColor = "var(--color-border-input)";
                  target.style.boxShadow = "none";
                  target.style.backgroundColor = "var(--color-input-bg)";
                }}
              >
                <input
                  type="password"
                  id="passwordInput"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  required
                  className="w-full border-none py-3.5 pr-1 text-base bg-transparent outline-none font-medium tracking-wide"
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-semibold text-[1.1rem] tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                color: "var(--color-text-green)",
                border: "1px solid var(--color-border-card)",
                borderRadius: "var(--radius-button)",
                backgroundColor: isLoading
                  ? "var(--color-primary-soft)"
                  : "transparent",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                target.style.backgroundColor = "var(--color-primary-dark)";
                target.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                if (!isLoading) {
                  target.style.backgroundColor = "transparent";
                  target.style.color = "var(--color-text-green)";
                }
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{mode === "register" ? "Creating account..." : "Logging in..."}</span>
                </>
              ) : (
                <>
                  <FaSignInAlt className="text-base" />
                  <span>{mode === "register" ? "Create Account" : "Login"}</span>
                </>
              )}
            </button>

            {/* Mode toggle */}
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setMode(mode === "login" ? "register" : "login");
              }}
              className="text-sm font-semibold"
              style={{ color: "var(--color-primary-dark)", background: "none", border: "none", cursor: "pointer" }}
            >
              {mode === "login"
                ? "New farmer? Create an account"
                : "Already have an account? Login"}
            </button>

            {/* Divider */}
            <div className="flex items-center my-0.5">
              <hr className="flex-grow border-t" style={{ borderColor: "var(--color-border-divider)" }} />
              <span className="px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Or</span>
              <hr className="flex-grow border-t" style={{ borderColor: "var(--color-border-divider)" }} />
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-semibold text-[1rem] tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
              style={{
                color: "#1f6e32",
                border: "1.5px solid var(--color-border-input)",
                borderRadius: "var(--radius-button)",
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                target.style.backgroundColor = "var(--color-primary-soft)";
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                target.style.backgroundColor = "#ffffff";
              }}
            >
              <FaGoogle className="text-lg text-green-700" />
              <span>Sign in with Google</span>
            </button>

            {/* Language Selector */}
            <div
              className="flex items-center justify-center gap-2.5 py-2.5 mt-1 rounded-xl font-medium text-[0.95rem] cursor-default transition-colors duration-200"
              style={{
                backgroundColor: "var(--color-lang-bg)",
                color: "var(--color-text-lang)",
                border: "1px solid var(--color-border-lang)",
                borderRadius: "var(--radius-button)",
              }}
            >
              <FaGlobe style={{ color: "var(--color-primary-light)" }} />
              <span>Language</span>
              <span
                className="px-4 py-0.5 rounded-xl font-semibold text-[0.9rem] tracking-wide"
                style={{
                  backgroundColor: "var(--color-badge-bg)",
                  color: "var(--color-text-badge)",
                  borderRadius: "var(--radius-badge)",
                  letterSpacing: "0.3px",
                }}
              >
                English
              </span>
              <FaChevronDown
                className="text-[0.7rem] ml-0.5"
                style={{ color: "#568a5e" }}
              />
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
