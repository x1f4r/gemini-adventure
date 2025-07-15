/**
 * Creates a small thumbnail from a base64 image string to save space.
 * @param base64Image The full-resolution base64 image string.
 * @param maxWidth The maximum width of the thumbnail.
 * @param maxHeight The maximum height of the thumbnail.
 * @returns A promise that resolves to a smaller, JPEG-formatted base64 thumbnail.
 */
export function createImageThumbnail(
  base64Image: string,
  maxWidth: number = 256,
  maxHeight: number = 256
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      let width = img.width;
      let height = img.height;

      // Calculate the new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = width * (maxHeight / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Get the data URL for the thumbnail
      resolve(canvas.toDataURL('image/jpeg', 0.7)); // Use JPEG with quality 0.7 for smaller size
    };

    img.onerror = (error) => {
      console.error("Error loading image for thumbnail creation:", error);
      // Fallback to a generic placeholder or reject
      reject(new Error('Image could not be loaded for thumbnailing.'));
    };
  });
}
