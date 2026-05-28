import { useState, useEffect, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const validateAuthFunction = useAuth().validateAuth;
  const isAuthenticated = useAuth().isAuthenticated;
  const validateAuth = useCallback(
    () => validateAuthFunction(),
    [validateAuthFunction],
  );
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    validateAuth().then(setAuth);
  }, [validateAuth]);

  useEffect(() => {
    if (isAuthenticated === false) navigate("/login");
  }, [isAuthenticated, navigate]);

  if (auth === null) return null;
  if (!auth) return <Navigate to="/login" replace />;
  return children;
}
