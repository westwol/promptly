import fetch from 'node-fetch';

async function toDataURL(imageUrl: string) {
  const res = await fetch(imageUrl);
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mime = res.headers.get('content-type') ?? 'image/png';
  return `data:${mime};base64,${base64}`;
}

export const mapAttachmentsForOpenAiSDK = async (attachments: Array<any>) => {
  if (attachments.length === 0) {
    return [];
  }

  const parsedAttachments = [];
  for await (const attachment of attachments) {
    const parsedAttachment = await toDataURL(attachment.url);
    parsedAttachments.push(parsedAttachment);
  }

  return [
    {
      role: 'user',
      content: parsedAttachments.map((parsedAttachment) => ({
        type: 'image_url',
        image_url: {
          url: parsedAttachment,
        },
      })),
    },
  ];
};
