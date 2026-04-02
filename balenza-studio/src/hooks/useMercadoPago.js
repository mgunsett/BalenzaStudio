import { useState } from "react";

export const useMercadoPago = () => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const createPreference = async ({ items, payer, orderId }) => {
    setLoading(true);
    setError(null);
    try {
      // Llama a la Cloud Function de Firebase
      const res = await fetch(
        `${import.meta.env.VITE_FUNCTIONS_URL}/createMPPreference`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, payer, orderId }),
        }
      );
      if (!res.ok) throw new Error("Error al crear preferencia de pago");
      const data = await res.json();
      setPreferenceId(data.preferenceId);
      return data.preferenceId;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { preferenceId, loading, error, createPreference };
};