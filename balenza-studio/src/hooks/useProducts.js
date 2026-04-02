import { useState, useEffect } from "react";
import { getProducts, getRelatedProducts } from "../services/firebase/products";

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const key = JSON.stringify(filters);

  useEffect(() => {
    setLoading(true);
    getProducts(filters)
      .then(setProducts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [key]);

  return { products, loading, error };
};

export const useRelatedProducts = (category, excludeId) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!category || !excludeId) return;
    setLoading(true);
    getRelatedProducts(category, excludeId)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [category, excludeId]);

  return { products, loading };
};