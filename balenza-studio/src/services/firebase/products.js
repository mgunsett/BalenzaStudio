import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const PRODUCTS_COL = "products";

export const getProducts = async (filters = {}) => {
  let q = collection(db, PRODUCTS_COL);
  const constraints = [where("active", "==", true)];

  if (filters.category) constraints.push(where("category", "==", filters.category));
  if (filters.featured !== undefined) constraints.push(where("featured", "==", filters.featured));
  if (filters.limit) constraints.push(limit(filters.limit));

  constraints.push(orderBy("createdAt", "desc"));

  const snap = await getDocs(query(q, ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getProductBySlug = async (slug) => {
  const q = query(
    collection(db, PRODUCTS_COL),
    where("slug", "==", slug),
    where("active", "==", true),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const getProductById = async (id) => {
  const snap = await getDoc(doc(db, PRODUCTS_COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const createProduct = async (data) => {
  return addDoc(collection(db, PRODUCTS_COL), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateProduct = async (id, data) => {
  return updateDoc(doc(db, PRODUCTS_COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (id) => {
  return updateDoc(doc(db, PRODUCTS_COL, id), { active: false, updatedAt: serverTimestamp() });
};

export const getFeaturedProducts = () => getProducts({ featured: true, limit: 1 });

export const getRelatedProducts = async (category, excludeId, max = 4) => {
  const products = await getProducts({ category, limit: max + 1 });
  return products.filter((p) => p.id !== excludeId).slice(0, max);
};