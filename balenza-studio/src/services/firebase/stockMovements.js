// src/services/firebase/stockMovements.js
import {
  collection, addDoc, getDocs, query,
  orderBy, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const COL = "stockMovements";

/**
 * createMovement — registra un movimiento de stock
 * data: { productId, productName, sizeKey, colorKey, quantity, type: "in"|"out"|"adjustment", reason }
 */
export const createMovement = async (data) =>
  addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
  });

/**
 * getMovements — trae movimientos con filtros opcionales
 * Para evitar índices compuestos, el filtrado principal es client-side.
 * Solo aplica where si se filtra por productId (necesita índice si combina con orderBy).
 */
export const getMovements = async (filters = {}) => {
  let q;
  if (filters.productId) {
    q = query(
      collection(db, COL),
      where("productId", "==", filters.productId),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(collection(db, COL), orderBy("createdAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
