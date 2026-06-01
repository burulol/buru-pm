import BigLock from "../components/BigLock";
import TextField from "../components/AuthTextField";
import SubmitBtn from "../components/AuthSubmitErrBtn";
import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [repeatPassword, setRepeatPassword] = useState("");
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
  }, [validateAuth, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  async function handleRegister(e) {
    e.preventDefault();

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!email) {
      setError("Email cannot be empty");
      return;
    }
    if (!password) {
      setError("Password cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const result = await register(email, password);

      if (!result.success) {
        setError(result.error);
      } else {
        const tokens = {
          salt: result.salt,
          limited_access_token: result.limited_access_token,
          full_access_token: result.full_access_token,
        };
        await setAuth(tokens, password);
      }
    } catch {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const validInput = !invalidEmail && !invalidPassword;

  const disableBtn = loading || !validInput || error;

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm p-8 space-y-8 shadow-lg rounded-lg">
        {/* Header */}
        <BigLock className="w-32 h-32 mx-auto" strokeWidth={0.25} />

        {/* Form */}
        <form className="space-y-4" onSubmit={handleRegister}>
          {/* Email */}
          <TextField
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onInvalid={setInvalidEmail}
          />

          {/* Password */}
          <TextField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onInvalid={setInvalidPassword}
          />

          {/* Repeat password */}
          <TextField
            type="repeat_password"
            placeholder="Repeat Password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />

          {/* Button */}
          <div className="space-y-3 pt-2">
            <SubmitBtn text="Register" disabled={disableBtn} error={error} />
          </div>
        </form>
      </div>
    </div>
  );
}
