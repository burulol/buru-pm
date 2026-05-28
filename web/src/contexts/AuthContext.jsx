import { createContext, useState } from "react";
import { pingServer } from "../services/auth";

const AuthContext = createContext();
export { AuthContext };

export function AuthProvider({ children }) {
  const [limitedToken, setLimitedToken] = useState(
    sessionStorage.getItem("limited_access_token"),
  );
  const [fullToken, setFullToken] = useState(
    sessionStorage.getItem("full_access_token"),
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function setTokens(tokens) {
    const { limited_access_token, full_access_token } = tokens;

    const isValid = await pingServer(limited_access_token);

    if (isValid) {
      setIsAuthenticated(true);
      setLimitedToken(limited_access_token);
      setFullToken(full_access_token);
      sessionStorage.setItem("limited_access_token", limited_access_token);
      sessionStorage.setItem("full_access_token", full_access_token);
    } else {
      clearTokens();
      setIsAuthenticated(false);
    }
  }

  function clearTokens() {
    sessionStorage.removeItem("limited_access_token");
    sessionStorage.removeItem("full_access_token");
    setIsAuthenticated(false);
    setLimitedToken(null);
    setFullToken(null);
  }

  async function validateAuth() {
    if (!limitedToken) return false;
    const isValid = await pingServer(limitedToken);

    if (!isValid) {
      clearTokens();
      setIsAuthenticated(false);
      return false;
    }
    setIsAuthenticated(true);
    return true;
  }

  return (
    <AuthContext.Provider
      value={{
        validateAuth,
        limitedToken,
        fullToken,
        setTokens,
        clearTokens,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
