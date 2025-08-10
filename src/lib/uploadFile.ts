export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_upload');

  const { env } = await import("@/shared/config/env");
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.client.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  const data = await response.json();
  return { url: data.secure_url, publicId: data.public_id };
} 