const COMPRESS_THRESHOLD_BYTES = 300 * 1024;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export interface CompressedImage {
  dataUrl: string;
  alt: string;
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("FileReader error"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = src;
  });
}

function isCompressibleRaster(mime: string): boolean {
  return mime === "image/png" || mime === "image/jpeg" || mime === "image/webp";
}

export async function compressImageFile(file: File): Promise<CompressedImage> {
  const alt = file.name || "image";

  if (!isCompressibleRaster(file.type) || file.size <= COMPRESS_THRESHOLD_BYTES) {
    return { dataUrl: await readAsDataUrl(file), alt };
  }

  const sourceUrl = await readAsDataUrl(file);
  const img = await loadImage(sourceUrl);

  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  if (longest <= MAX_DIMENSION && file.size <= 2 * COMPRESS_THRESHOLD_BYTES) {
    return { dataUrl: sourceUrl, alt };
  }

  const scale = longest > MAX_DIMENSION ? MAX_DIMENSION / longest : 1;
  const targetW = Math.max(1, Math.round(img.naturalWidth * scale));
  const targetH = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { dataUrl: sourceUrl, alt };
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const compressed = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  if (compressed.length >= sourceUrl.length) {
    return { dataUrl: sourceUrl, alt };
  }
  return { dataUrl: compressed, alt };
}
