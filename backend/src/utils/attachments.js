import fetch from 'node-fetch';

async function toDataURL(imageUrl) {
  const res = await fetch(imageUrl);
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mime = res.headers.get('content-type') ?? 'image/png';
  return `data:${mime};base64,${base64}`;
}

export const mapAttachmentsForOpenAiSDK = async (attachments) => {
  if (attachments.length === 0) {
    return [];
  }

  let parsedAttachments = [];
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
