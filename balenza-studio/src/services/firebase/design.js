import { doc, getDoc } from "firebase/firestore";
import { db } from "./config";

export const getBannerImages = async () => {
  const snap = await getDoc(doc(db, "design_web", "banner"));
  if (!snap.exists()) return [];
  const data = snap.data();
  return data.images || [];
};
