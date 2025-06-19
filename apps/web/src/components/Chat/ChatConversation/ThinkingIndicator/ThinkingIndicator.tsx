import React from 'react';

export const ThinkingIndicator = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex items-center gap-1 text-gray-400 duration-500">
      <span className="animate-bounce [animation-delay:-0.3s]">•</span>
      <span className="animate-bounce [animation-delay:-0.15s]">•</span>
      <span className="animate-bounce">•</span>
    </div>
  );
};
