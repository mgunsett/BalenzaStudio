import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const ORDERS_COL = "orders";

export const createOrder = async (orderData) => {
  return addDoc(collection(db, ORDERS_COL), {
    ...orderData,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getOrderById = async (id) => {
  const snap = await getDoc(doc(db, ORDERS_COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateOrderStatus = async (id, status, extra = {}) => {
  return updateDoc(doc(db, ORDERS_COL, id), {
    status,
    ...extra,
    updatedAt: serverTimestamp(),
  });
};

export const getOrdersByUser = async (userId) => {
  const q = query(
    collection(db, ORDERS_COL),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllOrders = async () => {
  const q = query(collection(db, ORDERS_COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
