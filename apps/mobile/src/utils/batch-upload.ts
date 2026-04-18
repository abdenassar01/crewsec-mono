import { api } from 'convex/_generated/api';
import { type Id } from 'convex/_generated/dataModel';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-convex-hooks';
import { showMessage } from 'react-native-flash-message';

type PhotoAsset = {
  uri: string;
  mimeType?: string;
  fileName?: string;
  width?: number;
  height?: number;
};

export function useBatchUpload() {
  const generateUploadUrl = useSafeMutation(api.storage.generateUploadUrl);

  const uploadPhotos = async (photos: PhotoAsset[]): Promise<Id<'_storage'>[]> => {
    const storageIds: Id<'_storage'>[] = [];

    try {
      console.log('Starting batch upload for', photos.length, 'photos');

      for (const photo of photos) {
        console.log('Uploading photo:', photo.uri);

        // Get upload URL for each photo
        const uploadUrl = await generateUploadUrl();
        console.log('Got upload URL');

        // Convert photo to blob
        const response = await fetch(photo.uri);
        if (!response.ok) {
          throw new Error(`Failed to fetch photo: ${response.status}`);
        }
        const blob = await response.blob();
        console.log('Photo converted to blob, size:', blob.size);

        // Upload to Convex
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': photo.mimeType || 'image/jpeg' },
          body: blob,
        });

        console.log('Upload response status:', uploadResponse.status);

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Upload failed with status: ${uploadResponse.status} - ${errorText}`);
        }

        const { storageId } = await uploadResponse.json();
        console.log('Photo uploaded with storageId:', storageId);
        storageIds.push(storageId);
      }

      showMessage({
        type: 'success',
        message: `${photos.length} image(s) uploaded successfully.`,
      });

      return storageIds;
    } catch (error) {
      console.error('Batch upload error:', error);
      showMessage({
        type: 'danger',
        message: error instanceof Error ? error.message : 'Failed to upload images.',
      });
      throw error;
    }
  };

  return { uploadPhotos };
}