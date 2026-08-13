import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export async function uploadImageToFirebaseStorage(
  file: File,
  folder: string = 'resort_uploads'
): Promise<string> {
  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `${folder}/${timestamp}_${cleanFileName}`);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    if (!downloadUrl) {
      throw new Error('Firebase Storage returned an empty download URL.');
    }
    return downloadUrl;
  } catch (error) {
    console.error('Firebase Storage upload failed:', error);
    throw error;
  }
}
