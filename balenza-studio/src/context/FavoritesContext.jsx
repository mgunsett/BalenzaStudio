import { createContext, useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { addFavorite, getUserFavorites, removeFavorite } from "../services/firebase/favorites";
import { getProductById, getProductsByIds } from "../services/firebase/products";

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setFavoriteIds([]);
      setFavoriteProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getUserFavorites(user.uid)
      .then((ids) => {
        setFavoriteIds(ids);
        return ids.length ? getProductsByIds(ids) : [];
      })
      .then(setFavoriteProducts)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const isFavorite = useCallback((productId) => favoriteIds.includes(productId), [favoriteIds]);

  const toggleFavorite = useCallback(async (productId, productData) => {
    if (!user?.uid) {
      toast.error("Iniciá sesión para usar favoritos");
      return false;
    }

    const exists = favoriteIds.includes(productId);
    try {
      if (exists) {
        await removeFavorite(user.uid, productId);
        setFavoriteIds((prev) => prev.filter((id) => id !== productId));
        setFavoriteProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        await addFavorite(user.uid, productId);
        setFavoriteIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
        if (productData) {
          setFavoriteProducts((prev) => (
            prev.some((p) => p.id === productId) ? prev : [...prev, productData]
          ));
        } else {
          const fetched = await getProductById(productId);
          if (fetched) {
            setFavoriteProducts((prev) => (
              prev.some((p) => p.id === productId) ? prev : [...prev, fetched]
            ));
          }
        }
      }

      toast.success(exists ? "Eliminado de favoritos" : "Agregado a favoritos", {
        duration: 1500,
        icon: exists ? "💔" : "❤️",
      });
      return !exists;
    } catch {
      toast.error("No se pudo actualizar favoritos");
      return exists;
    }
  }, [favoriteIds, user?.uid]);

  return (
    <FavoritesContext.Provider value={{
      favoriteIds,
      favoriteProducts,
      loading,
      isFavorite,
      toggleFavorite,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
};
