import axios from 'axios';
import FormData from 'form-data';
import { CLOUDINARY_CONFIG } from '@/config/cloudinary';

export const uploadImage = async (imageAsset: any) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageAsset.uri,
      type: 'image/jpeg',
      name: `profile-${Date.now()}.jpg`,
    });
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset); // Unsigned upload preset
    formData.append('api_key', CLOUDINARY_CONFIG.apikey);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    console.log('Image uploaded successfully:', response.data);
    return response.data.secure_url; // Return the URL of the uploaded image
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Unable to upload image');
  }
};