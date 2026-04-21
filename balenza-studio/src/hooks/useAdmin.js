import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const useAdmin = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const isAdmin = profile?.role === "admin";

  // Redirigir si no es admin (solo cuando ya terminó de cargar)
  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  return { isAdmin, loading };
};

