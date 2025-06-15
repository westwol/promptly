import { FormEvent, useRef, KeyboardEvent, useState } from 'react';
import { ArrowUp, Image as ImageIcon, X } from 'lucide-react';

import { ModelSelectionPopover } from './ModelSelectionPopover';
import { KEY_MAP } from '@t3chat/constants/keyboard';

interface ChatMessageInputPanelProps {
  onSendChatRequest: (content: string, imageFile?: File) => void;
}

export const ChatMessageInputPanel = ({ onSendChatRequest }: ChatMessageInputPanelProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const onSubmitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      content: { value: string };
    };
    const content = formElements.content.value;

    onSendChatRequest(content, selectedImage || undefined);

    formElements.content.value = '';
    setSelectedImage(null);
    setImagePreview(null);
    if (buttonRef.current) {
      buttonRef.current.disabled = true;
    }
  };

  const onTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === KEY_MAP.ENTER && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const onTextareaInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    if (buttonRef.current) {
      buttonRef.current.disabled = !event.currentTarget.value;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form
      ref={formRef}
      className="text-secondary-foreground relative mx-auto flex w-full flex-col items-stretch gap-2 rounded-t-xl bg-[#2C2632] px-3 pt-3 max-sm:pb-6 sm:max-w-3xl"
      onSubmit={onSubmitRequest}
    >
      <div className="flex items-center gap-2">
        <textarea
          name="content"
          className="placeholder:text-secondary-foreground/60 w-full resize-none bg-transparent leading-6 text-white outline-none disabled:opacity-0"
          placeholder="Type your message here..."
          onKeyDown={onTextareaKeyDown}
          onInput={onTextareaInput}
        />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <button
          type="button"
          onClick={triggerImageUpload}
          className="rounded-full p-2 transition-colors hover:bg-gray-700"
          title="Upload image"
        >
          <ImageIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {imagePreview && (
        <div className="relative inline-block">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg">
            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-1 right-1 rounded-full bg-gray-800 p-1 transition-colors hover:bg-gray-700"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      <ModelSelectionPopover />
      <button
        ref={buttonRef}
        className="send-button absolute right-5 bottom-5 z-10 flex h-9 w-9 items-center justify-center rounded-md disabled:opacity-70"
        type="submit"
        disabled
      >
        <ArrowUp color="white" size={20} />
      </button>
    </form>
  );
};
