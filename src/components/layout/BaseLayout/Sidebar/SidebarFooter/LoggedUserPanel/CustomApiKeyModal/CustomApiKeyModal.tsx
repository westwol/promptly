import { Dialog, Switch } from '@t3chat/components/ui';
import { Key } from 'lucide-react';

import { AnthropicIcon, DeepseekIcon, GeminiIcon, OpenaiIcon } from '@t3chat/icons';
import { usePreferencesStore } from '@t3chat/store/preferences';

export const CustomApiKeyModal = () => {
  const apiKeys = usePreferencesStore((state) => state.apiKeys);
  const setApiKey = usePreferencesStore((state) => state.setApiKey);
  const setApiKeyEnabled = usePreferencesStore((state) => state.setApiKeyEnabled);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <li className="hover:bg-primary flex items-center gap-2 rounded-md p-2 text-sm transition-all hover:opacity-70">
          <Key size={12} />
          <span>Bring your API Key</span>
        </li>
      </Dialog.Trigger>
      <Dialog.Content className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title>Bring your own API Key</Dialog.Title>
          <Dialog.Title className="text-muted text-sm">
            Ran out of credits? Use your own api key
          </Dialog.Title>
        </Dialog.Header>
        <div className="flex w-full flex-col gap-2">
          <div className="border-chat-border mb-2 flex items-center border-b px-3">
            <OpenaiIcon className="mr-3 ml-px size-4" />
            <input
              placeholder="Enter your OpenAI Api Key"
              className="placeholder-muted-foreground/50 w-full bg-transparent py-2 text-sm text-white placeholder:select-none focus:outline-none"
              defaultValue={apiKeys.openai.key}
              onChange={(event) => setApiKey('openai', event.target.value)}
            />
            <Switch
              className="ml-2"
              defaultChecked={apiKeys.openai.enabled}
              onCheckedChange={(checked) => setApiKeyEnabled('openai', checked)}
            />
          </div>
          <div className="border-chat-border mb-2 flex items-center border-b px-3">
            <AnthropicIcon className="mr-3 ml-px size-4" />
            <input
              placeholder="Enter your Anthropic Api Key"
              className="placeholder-muted-foreground/50 w-full bg-transparent py-2 text-sm text-white placeholder:select-none focus:outline-none"
              defaultValue={apiKeys.anthropic.key}
              onChange={(event) => setApiKey('anthropic', event.target.value)}
            />
            <Switch
              className="ml-2"
              defaultChecked={apiKeys.anthropic.enabled}
              onCheckedChange={(checked) => setApiKeyEnabled('anthropic', checked)}
            />
          </div>
          <div className="border-chat-border mb-2 flex items-center border-b px-3">
            <GeminiIcon className="mr-3 ml-px size-4" />
            <input
              placeholder="Enter your Gemini API Key"
              className="placeholder-muted-foreground/50 w-full bg-transparent py-2 text-sm text-white placeholder:select-none focus:outline-none"
              defaultValue={apiKeys.gemini.key}
              onChange={(event) => setApiKey('gemini', event.target.value)}
            />
            <Switch
              className="ml-2"
              defaultChecked={apiKeys.gemini.enabled}
              onCheckedChange={(checked) => setApiKeyEnabled('gemini', checked)}
            />
          </div>
          <div className="border-chat-border mb-2 flex items-center border-b px-3">
            <DeepseekIcon className="mr-3 ml-px size-4" />
            <input
              placeholder="Enter your Deepseek API Key"
              className="placeholder-muted-foreground/50 w-full bg-transparent py-2 text-sm text-white placeholder:select-none focus:outline-none"
              defaultValue={apiKeys.deepseek.key}
              onChange={(event) => setApiKey('deepseek', event.target.value)}
            />
            <Switch
              className="ml-2"
              defaultChecked={apiKeys.deepseek.enabled}
              onCheckedChange={(checked) => setApiKeyEnabled('deepseek', checked)}
            />
          </div>
          <span className="text-xs">
            Disclaimer: for privacy reasons, the API keys are stored within your browser, we dont
            store them in our database
          </span>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
