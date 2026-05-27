import BigLock from "../../components/bigLock";
import { useState, useEffect } from "react";
import { Mail, Lock, Repeat2 } from "lucide-react";
import { register } from "../../services/auth";

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePassword(value) {
  return value.length >= 8;
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => setError(""), 2000);
    return () => clearTimeout();
  }, [error]);

  async function handleRegister(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const result = await register(email, password);

      if (!result.success) {
        setError(result.error);
      } else {
        const tokens = {
          full_access_token: result.full_access_token,
          limited_access_token: result.limited_access_token,
        };
        console.log("Registration successful, received tokens:", tokens);
      }
    } catch {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const validInput =
    validateEmail(email) &&
    validatePassword(password) &&
    password === repeatPassword;

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm p-8 space-y-8 shadow-md border border-fuchsia-700/20 shadow-fuchsia-700/20 rounded-lg">
        {/* Header */}
        <div className="text-center space-y-3">
          <BigLock className="text-fuchsia-700 w-32 h-32 mx-auto drop-shadow-[0_0_12px_rgba(192,38,211,0.25)]" />
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleRegister}>
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-700/60 w-4 h-4" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 text-white placeholder-gray-500
                         focus:outline-none focus:ring-1 focus:ring-fuchsia-700/60 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-700/60 w-4 h-4" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 text-white placeholder-gray-500
                         focus:outline-none focus:ring-1 focus:ring-fuchsia-700/60 transition"
            />
          </div>

          {/* Repeat password */}
          <div className="relative">
            <Repeat2 className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-700/60 w-5 h-5" />
            <input
              type="password"
              placeholder="Repeat Password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 text-white placeholder-gray-500
                         focus:outline-none focus:ring-1 focus:ring-fuchsia-700/60 transition"
            />
          </div>

          {/* Error message */}

          {/* Button */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading || !validInput || error}
              className={`w-full py-2 rounded-lg bg-fuchsia-700 text-black font-medium
                                ${loading || !validInput || error ? "opacity-70" : "hover:bg-fuchsia-600 transition"}
                                ${error || password !== repeatPassword ? "bg-red-500" : ""}`}
            >
              {error
                ? error
                : password !== repeatPassword
                  ? "Passwords do not match"
                  : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
