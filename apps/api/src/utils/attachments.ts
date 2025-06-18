const SUPPORTED_IMAGE_TYPES = ['image/'];
const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const SUPPORTED_TEXT_TYPES = ['text/plain'];

interface Attachment {
  mimeType: string;
  name: string;
  url: string;
}

async function toDataURL(imageUrl: string): Promise<string> {
  try {
    const { default: fetch } = await import('node-fetch');
    const res = await fetch(imageUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mime = res.headers.get('content-type') ?? 'image/png';

    return `data:${mime};base64,${base64}`;
  } catch (error) {
    console.error(`Error converting image to data URL: ${imageUrl}`, error);
    throw error;
  }
}

async function fetchTextContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch text: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`Error fetching text content from: ${url}`, error);
    throw error;
  }
}

function categorizeAttachments(attachments: Attachment[]) {
  const imageAttachments = attachments.filter((attachment) =>
    SUPPORTED_IMAGE_TYPES.some((type) => attachment.mimeType.startsWith(type))
  );

  const documentAttachments = attachments.filter((attachment) =>
    SUPPORTED_DOCUMENT_TYPES.includes(attachment.mimeType)
  );

  const textAttachments = attachments.filter((attachment) =>
    SUPPORTED_TEXT_TYPES.includes(attachment.mimeType)
  );

  return { imageAttachments, documentAttachments, textAttachments };
}

async function processImageAttachments(imageAttachments: Attachment[]) {
  if (imageAttachments.length === 0) return [];

  const imagePromises = imageAttachments.map(async (attachment) => {
    try {
      const dataUrl = await toDataURL(attachment.url);
      return {
        type: 'image_url',
        image_url: { url: dataUrl },
      };
    } catch (error) {
      console.error(`Failed to process image attachment: ${attachment.url}`, error);
      return null;
    }
  });

  const results = await Promise.all(imagePromises);
  return results.filter((result): result is NonNullable<typeof result> => result !== null);
}

async function processDocumentAttachments(documentAttachments: Attachment[]) {
  if (documentAttachments.length === 0) return [];

  const documentPromises = documentAttachments.map(async (attachment) => {
    try {
      const textContent = await fetchTextContent(attachment.url);
      return {
        type: 'text',
        text: `[Document: ${attachment.name}]\n${textContent}`,
      };
    } catch (error) {
      console.error(`Failed to process document attachment: ${attachment.url}`, error);
      return null;
    }
  });

  const results = await Promise.all(documentPromises);
  return results.filter((result): result is NonNullable<typeof result> => result !== null);
}

async function processTextAttachments(textAttachments: Attachment[]) {
  if (textAttachments.length === 0) return [];

  const textPromises = textAttachments.map(async (attachment) => {
    try {
      const textContent = await fetchTextContent(attachment.url);
      return {
        type: 'text',
        text: textContent,
      };
    } catch (error) {
      console.error(`Failed to process text attachment: ${attachment.url}`, error);
      return null;
    }
  });

  const results = await Promise.all(textPromises);
  return results.filter((result): result is NonNullable<typeof result> => result !== null);
}

export const mapAttachmentsForOpenAiSDK = async (attachments: Attachment[]) => {
  try {
    if (attachments.length === 0) {
      return [];
    }

    const { imageAttachments, documentAttachments, textAttachments } =
      categorizeAttachments(attachments);

    const [imageContent, textContent, documentContent] = await Promise.all([
      processImageAttachments(imageAttachments),
      processTextAttachments(textAttachments),
      processDocumentAttachments(documentAttachments),
    ]);

    const processedAttachments = [...imageContent, ...documentContent, ...textContent];

    if (processedAttachments.length === 0) {
      return [];
    }

    return [
      {
        role: 'user',
        content: processedAttachments,
      },
    ];
  } catch (error) {
    console.error('Error processing attachments:', error);
    throw new Error(
      `Failed to process attachments: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};
