import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

export const uploadProductImage = (file, productId, onProgress) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `products/${productId}/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        if (onProgress) onProgress(pct);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
};

export const deleteImage = async (url) => {
  const storageRef = ref(storage, url);
  return deleteObject(storageRef);
};
