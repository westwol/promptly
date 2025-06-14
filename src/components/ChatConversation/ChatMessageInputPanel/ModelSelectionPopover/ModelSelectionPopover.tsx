import { ChangeEvent, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LucideSearch, Squirrel } from 'lucide-react';

import { Popover } from '@t3chat/components/ui';
import { LlmModel, LlmModelType } from '@t3chat/interfaces/llmModels';
import { usePreferencesStore } from '@t3chat/store/preferences';
import { AVAILABLE_MODELS } from '@t3chat/fixtures/availableModels';

import { ModelLineItem } from './ModelLineItem';

export const ModelSelectionPopover = () => {
  const preferencesStore = usePreferencesStore();
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [modelSearchQuery, setModelSearchQuery] = useState<string>('');

  const filteredModels = useMemo(() => {
    if (!modelSearchQuery.trim()) {
      return AVAILABLE_MODELS;
    }

    const query = modelSearchQuery.toLowerCase().trim();
    return AVAILABLE_MODELS.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.model.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query)
    );
  }, [modelSearchQuery]);

  const onChangeSearchModel = (event: ChangeEvent<HTMLInputElement>) => {
    setModelSearchQuery(event.target.value);
  };

  const onSelectModel = (model: LlmModel) => {
    setIsPopoverOpen(false);
    preferencesStore.setModel(model);
  };

  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <Popover.Trigger className="disabled:hover:text-foreground/50 hover:hover:bg-secondary/20 relative mb-1.5 flex h-10 w-fit cursor-pointer items-center justify-center gap-2 rounded-md px-2 text-xs font-medium whitespace-nowrap text-white transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
        {preferencesStore.model.name}
        <motion.div animate={{ rotate: isPopoverOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown />
        </motion.div>
      </Popover.Trigger>
      <Popover.Content
        side="top"
        align="start"
        className="bg-primary w-[440px] max-w-[500px] border-0"
      >
        <div className="border-chat-border mb-2 flex items-center border-b px-3">
          <LucideSearch className="mr-3 ml-px size-4" />
          <input
            role="searchbox"
            placeholder="Search models..."
            className="placeholder-muted-foreground/50 w-full bg-transparent py-2 text-sm text-white placeholder:select-none focus:outline-none"
            value={modelSearchQuery}
            onChange={onChangeSearchModel}
          />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            className="overflow-hidden rounded-lg text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {filteredModels.length > 0 ? (
              filteredModels.map((model) => (
                <ModelLineItem key={model.model} {...model} onSelect={() => onSelectModel(model)} />
              ))
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Squirrel className="h-4 w-4" />
                <span className="text-sm">Upps! no models were found</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Popover.Content>
    </Popover.Root>
  );
};
