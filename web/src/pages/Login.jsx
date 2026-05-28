import BigLock from "../components/BigLock";
import TextField from "../components/AuthTextField";
import SubmitBtn from "../components/AuthSubmitErrBtn";
import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { login } from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, validateAuth, setAuth } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(""), 2000);
    return () => clearTimeout(id);
  }, [error]);

  useEffect(() => {
    const navigateIfAuthenticated = async () => {
      const valid = await validateAuth();
      if (valid) {
        navigate("/");
      }
    };
    navigateIfAuthenticated();
  }, [navigate, validateAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [navigate, isAuthenticated]);

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.error);
      } else {
        const tokens = {
          full_access_token: result.full_access_token,
          limited_access_token: result.limited_access_token,
        };
        await setAuth(tokens);
      }
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm p-8 space-y-8 shadow-lg border border-fuchsia-700/20 shadow-fuchsia-700/20 rounded-lg">
        {/* Header */}
        <BigLock className="w-32 h-32 mx-auto" strokeWidth={0.25} />

        {/* Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Email */}
          <TextField
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={false}
          />

          {/* Password */}
          <TextField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isInvalid={false}
          />

          {/* Buttons */}
          <div className="space-y-3 pt-2">
            <SubmitBtn text="Login" disabled={loading || error} error={error} />

            <Link
              className="w-full py-2 rounded-lg border border-fuchsia-700/30 text-gray-300
                               hover:border-fuchsia-700/60 transition flex justify-center items-center"
              to="/register"
            >
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
