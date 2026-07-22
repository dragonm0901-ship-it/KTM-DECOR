/**
 * Client-side utility for compressing images before uploading to the backend.
 * Scales down large photos (from mobile phone camera or high-res PC files) to a max dimension
 * and encodes them to compressed JPEG data URLs (~150KB - 300KB).
 */
export const compressImage = (
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file selected"));
    }

    // Ensure the file is an image
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Selected file is not an image."));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image into browser memory"));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio keeping dimensions within maxWidth x maxHeight
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback if canvas context is unavailable
          return resolve(event.target?.result as string);
        }

        // Fill canvas with clean white background (prevents transparent PNGs from turning black)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // High quality smooth resampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with given quality
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};
