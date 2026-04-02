import { doc, runTransaction } from "firebase/firestore";
import { db } from "./config";

/**
 * Descuenta stock de múltiples productos en una transacción atómica.
 * Se llama desde el webhook de MercadoPago (Cloud Function),
 * pero también puede usarse desde el cliente para transferencias.
 *
 * items: [{ productId, size, quantity }]
 */
export const decrementStock = async (items) => {
  return runTransaction(db, async (transaction) => {
    const updates = [];

    for (const item of items) {
      const ref = doc(db, "products", item.productId);
      const snap = await transaction.get(ref);

      if (!snap.exists()) throw new Error(`Producto ${item.productId} no encontrado`);

      const sizes = snap.data().sizes || {};
      const currentStock = sizes[item.size] || 0;

      if (currentStock < item.quantity) {
        throw new Error(`Stock insuficiente para ${snap.data().name} (talle ${item.size})`);
      }

      updates.push({
        ref,
        data: {
          [`sizes.${item.size}`]: currentStock - item.quantity,
        },
      });
    }

    for (const { ref, data } of updates) {
      transaction.update(ref, data);
    }
  });
};