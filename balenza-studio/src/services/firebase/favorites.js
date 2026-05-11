import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "./config";

export const getUserFavorites = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().favorites || []) : [];
};

export const addFavorite = async (uid, productId) => {
  return updateDoc(doc(db, "users", uid), {
    favorites: arrayUnion(productId),
  });
};

export const removeFavorite = async (uid, productId) => {
  return updateDoc(doc(db, "users", uid), {
    favorites: arrayRemove(productId),
  });
};
