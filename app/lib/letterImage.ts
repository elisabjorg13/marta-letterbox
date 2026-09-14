import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const maxWidth = 1400;
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82)
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(blob);
  });
}

export async function uploadLetterImage(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const safeName = file.name.replace(/[^\w.-]/g, "_") || "photo.jpg";
  const path = `letter-images/${Date.now()}-${safeName}`;

  try {
    const snapshot = await uploadBytes(ref(storage, path), compressed, {
      contentType: compressed.type || "image/jpeg",
    });
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.warn("Storage upload failed, saving a compressed copy instead:", error);
    return blobToDataUrl(compressed);
  }
}
