import { API_BASE_URL, api } from './api';

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

export async function uploadImage(file, target = 'item') {
  if (!file) throw new Error('Please choose an image file.');
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Images up to 10MB are supported.');
  }
  const formData = new FormData();
  formData.append('image', file);
  const token = api.getToken();
  const response = await fetch(`${API_BASE_URL}/api/uploads/${target}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || 'Upload failed');
  }
  return payload.url;
}
