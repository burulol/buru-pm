import { useState, useEffect, useRef } from "react";
import { validateMasterPassword } from "../services/vault";
import TextField from "../components/AuthTextField";
import BigLock from "./BigLock";
import AuthSubmitErrBtn from "./AuthSubmitErrBtn";

export default function MasterPasswordPrompt({
  isPrompting,
  onSubmit,
  onCancel,
}) {
  const [masterPassword, setMasterPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      const fullToken = await validateMasterPassword(masterPassword);
      onSubmit({ fullToken, masterPassword });
      setMasterPassword("");
    } catch {
      setError("Invalid master password");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setError("");
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [error]);

  useEffect(() => {
    if (isPrompting && inputRef.current) {
      inputRef.current.focus();
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onCancel();
        setMasterPassword("");
        setError("");
      }
    }

    if (isPrompting) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPrompting, onCancel]);

  return (
    <>
      {isPrompting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="w-full max-w-sm p-8 border rounded-xl bg-black">
            <BigLock className="w-32 h-32 mx-auto mb-4" strokeWidth={0.25} />
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                ref={inputRef}
                type="password"
                value={masterPassword}
                onChange={(e) => {
                  setMasterPassword(e.target.value);
                  setError("");
                }}
                placeholder="Master password"
                isInvalid={false}
              />
              <AuthSubmitErrBtn
                className="text-white border border-fuchsia-700/20"
                type="submit"
                disabled={loading || error}
                text={loading ? "Verifying..." : "Confirm"}
                error={error}
              />
              <button
                className="w-full py-2 rounded-lg border border-fuchsia-700/30 text-gray-300
                               hover:border-fuchsia-700/60 transition flex justify-center items-center"
                onClick={() => {
                  onCancel();
                  setMasterPassword("");
                  setError("");
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
