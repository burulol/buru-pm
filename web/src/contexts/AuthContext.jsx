import { createContext, useState } from "react";
import { pingServer } from "../services/auth";
import { encrypt, deriveEncryptionKey } from "../services/crypto";

const AuthContext = createContext();
export { AuthContext };

export function AuthProvider({ children }) {
  const [salt, setSalt] = useState(sessionStorage.getItem("salt"));
  const [limitedToken, setLimitedToken] = useState(
    sessionStorage.getItem("limited_access_token"),
  );
  const [fullToken, setFullToken] = useState(
    sessionStorage.getItem("full_access_token"),
  );
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  async function setAuth(tokens, master_password) {
    const { salt, limited_access_token, full_access_token } = tokens;

    const isValid = await pingServer(limited_access_token);

    if (isValid) {
      setIsAuthenticated(true);
      setSalt(salt);
      setLimitedToken(limited_access_token);
      sessionStorage.setItem("salt", salt);
      sessionStorage.setItem("limited_access_token", limited_access_token);

      const encryptedToken = await encrypt(
        full_access_token,
        await deriveEncryptionKey(master_password),
      );
      setFullToken(encryptedToken.iv + ":" + encryptedToken.ciphertext);
      sessionStorage.setItem(
        "full_access_token",
        encryptedToken.iv + ":" + encryptedToken.ciphertext,
      );
    } else {
      clearAuth();
      setIsAuthenticated(false);
    }
  }

  function clearAuth() {
    sessionStorage.removeItem("salt");
    sessionStorage.removeItem("limited_access_token");
    sessionStorage.removeItem("full_access_token");
    setIsAuthenticated(false);
    setLimitedToken(null);
    setFullToken(null);
  }

  async function validateAuth() {
    if (!salt || !limitedToken || !fullToken) {
      clearAuth();
      setIsAuthenticated(false);
      return false;
    }
    const isValid = await pingServer(limitedToken);

    if (!isValid) {
      clearAuth();
      setIsAuthenticated(false);
      return false;
    }
    setIsAuthenticated(true);
    return true;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        salt,
        limitedToken,
        fullToken,
        validateAuth,
        setAuth,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
