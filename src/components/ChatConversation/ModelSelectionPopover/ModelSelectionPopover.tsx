import { ChangeEvent, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideSearch, Squirrel } from "lucide-react";

import { Popover } from "@t3chat/components/ui";
import { LlmModel, LlmModelType } from "@t3chat/interfaces/llmModels";

import { ModelLineItem } from "./ModelLineItem";
import { AVAILABLE_MODELS } from "@t3chat/fixtures/availableModels";
import { usePreferencesStore } from "@t3chat/store/preferences";

export const ModelSelectionPopover = () => {
  const preferencesStore = usePreferencesStore();
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [modelSearchQuery, setModelSearchQuery] = useState<string>("");

  const filteredModels = useMemo(() => {
    if (!modelSearchQuery.trim()) {
      return AVAILABLE_MODELS;
    }

    const query = modelSearchQuery.toLowerCase().trim();
    return AVAILABLE_MODELS.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.model.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query),
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
      <Popover.Trigger className="w-8 inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 disabled:hover:bg-transparent disabled:hover:text-foreground/50 h-8 rounded-md text-xs relative gap-2 px-2 py-1.5 text-white">
        {preferencesStore.model.name}
      </Popover.Trigger>
      <Popover.Content className="bg-primary w-[440px] max-w-[500px] border-0">
        <div className="flex items-center border-b border-chat-border px-3 mb-2">
          <LucideSearch className="ml-px mr-3 size-4" />
          <input
            role="searchbox"
            placeholder="Search models..."
            className="w-full bg-transparent py-2 text-white text-sm placeholder-muted-foreground/50 placeholder:select-none focus:outline-none"
            value={modelSearchQuery}
            onChange={onChangeSearchModel}
          />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            className="rounded-lg overflow-hidden text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {filteredModels.length > 0 ? (
              filteredModels.map((model) => (
                <ModelLineItem
                  key={model.model}
                  name={model.name}
                  type={model.type as LlmModelType}
                  description={model.description}
                  onSelect={() => onSelectModel(model)}
                />
              ))
            ) : (
              <div className="flex gap-2 justify-center items-center">
                <Squirrel className="w-4 h-4" />
                <span className="text-sm">Upps! no models were found</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Popover.Content>
    </Popover.Root>
  );
};
