import { Platform } from 'react-native';

const CLOUD_NAME = 'dqu9umaxf';
const UPLOAD_PRESET = 'onjimart';

/**
 * Uploads a local image URI to Cloudinary using unsigned upload.
 * Handles both:
 *   - Native (iOS/Android): file:/// URI  → uses RN FormData object format
 *   - Web (browser):        blob: URI     → fetches blob first, then appends as File
 * @param localUri - The local file URI from expo-image-picker
 * @returns The permanent public Cloudinary URL (https://res.cloudinary.com/...)
 */
export async function uploadImageToCloudinary(localUri: string): Promise<string> {
    const formData = new FormData();

    if (Platform.OS === 'web') {
        // On web, expo-image-picker returns a blob: URL.
        // We must fetch the blob and attach it as a proper File object.
        const blobResponse = await fetch(localUri);
        const blob = await blobResponse.blob();
        formData.append('file', new File([blob], 'profile.jpg', { type: 'image/jpeg' }));
    } else {
        // React Native (iOS / Android) format
        formData.append('file', {
            uri: localUri,
            type: 'image/jpeg',
            name: 'profile.jpg',
        } as any);
    }

    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData,
            // Do NOT set Content-Type manually — fetch sets it with the correct boundary
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Cloudinary upload failed: ${error}`);
    }

    const data = await response.json();

    // secure_url is the permanent HTTPS CDN link
    return data.secure_url as string;
}
