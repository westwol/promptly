import { UTApi, UTFile } from 'uploadthing/server';

const utapi = new UTApi();

export const uploadBase64Image = async (
  base64Data: string,
  filename: string = 'generated-image.png'
) => {
  try {
    const base64WithoutPrefix = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

    const buffer = Buffer.from(base64WithoutPrefix, 'base64');

    const file = new UTFile([buffer], filename, {
      type: 'image/png',
    });

    const response = await utapi.uploadFiles([file]);

    console.log({ response });

    if (response && response.length > 0 && response[0].data) {
      return response[0].data.url;
    }

    throw new Error('Failed to upload image to uploadthing');
  } catch (error) {
    console.error('Error uploading base64 image to uploadthing:', error);
    throw error;
  }
};
