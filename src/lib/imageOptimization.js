/**
 * Compresses and resizes an image file before upload.
 * @param {File} file - The image file to process.
 * @param {number} maxWidth - The maximum width of the output image.
 * @param {number} quality - The quality of the output image (0 to 1).
 * @returns {Promise<File>} A promise that resolves with the optimized image file.
 */
export const optimizeImageForMobile = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxWidth / img.width;
        const newWidth = img.width > maxWidth ? maxWidth : img.width;
        const newHeight = img.width > maxWidth ? img.height * scale : img.height;

        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};