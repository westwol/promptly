import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ScrollToBottomPanelProps {
  shouldDisplayScrollToBottom: boolean;
  onScrollToBottom: () => void;
}

export const ScrollToBottomPanel = ({
  shouldDisplayScrollToBottom,
  onScrollToBottom,
}: ScrollToBottomPanelProps) => {
  return (
    <AnimatePresence>
      {shouldDisplayScrollToBottom && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-primary/80 absolute bottom-30 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-2 rounded-xl p-2 text-xs text-white"
          onClick={onScrollToBottom}
        >
          <span className="font-bold">Scroll to the bottom</span>
          <ChevronDown size={12} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
