export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Please choose an image file.'));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      reject(new Error('Images up to 10MB are supported.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.readAsDataURL(file);
  });
}

