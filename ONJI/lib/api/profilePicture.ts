import { Platform } from 'react-native';
import axiosInstance from './axiosConfig';

export interface UploadProfilePictureResponse {
  profilePictureUrl: string;
}

export async function uploadProfilePicture(fileUri: string, entityType: 'supplier' | 'retailer', entityId: string): Promise<string> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    formData.append('file', new File([blob], 'profile.jpg', { type: 'image/jpeg' }));
  } else {
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);
  }

  // Use axiosInstance baseURL so uploads go to the same host as other API calls
  const uploadPath = `/api/${entityType}/${entityId}/profile-picture`;

  // Debug log to help USB/device testing
  console.log('Uploading profile picture to:', (axiosInstance.defaults && axiosInstance.defaults.baseURL) ? `${axiosInstance.defaults.baseURL}${uploadPath}` : uploadPath);

  try {
    const res = await axiosInstance.post(uploadPath, formData);

    const data: UploadProfilePictureResponse = res.data;
    return data.profilePictureUrl;
  } catch (err: any) {
    const message = err?.response?.data || err?.message || 'Upload failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
}
