export async function toDataUrlIfNeeded(src: string): Promise<string> {
  if (src.startsWith("data:")) {
    return src;
  }
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`Unable to load reference image (${response.status}).`);
  }
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read image data."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read image blob."));
    reader.readAsDataURL(blob);
  });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read uploaded file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read uploaded file."));
    reader.readAsDataURL(file);
  });
}

export function downloadImageUrl(imageUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "brand-asset";
}
