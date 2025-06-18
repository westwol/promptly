import { generateReactHelpers, generateUploadButton } from '@uploadthing/react';

import { OurFileRouter } from '@t3chat/app/api/uploadthing/core';
import { ClientUploadedFileData } from 'uploadthing/types';

export const UploadButton = generateUploadButton<OurFileRouter>();

export type UploadedFileData = ClientUploadedFileData<{ uploadedBy: string }>;

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
