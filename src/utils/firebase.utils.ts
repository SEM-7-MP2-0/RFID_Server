import storage from '../storage/firebase';
import { v4 as uuidv4 } from 'uuid';

export const deleteImage = async (filename: string) => {
  const bucket = storage.bucket();
  await bucket.file(filename).delete();
};

export const uploadFileToDestination = async (
  filePath: string,
  contentType: string,
  destination: string
): Promise<string> => {
  const bucket = storage.bucket();
  const fileUploded = await bucket.upload(filePath, {
    destination: `${destination}/${uuidv4()}`,
    metadata: {
      contentType: contentType,
      metadata: {
        firebaseStorageDownloadTokens: uuidv4(),
      },
    },
  });
  const url = `https://firebasestorage.googleapis.com/v0/b/${
    bucket.name
  }/o/${encodeURIComponent(fileUploded[0].name)}?alt=media&token=${
    fileUploded[0].metadata.metadata.firebaseStorageDownloadTokens
  }`;

  return url;
};
