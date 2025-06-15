import React from "react";

export const ThinkingIndicator = () => {
  return (
    <div className="flex items-center gap-1 text-gray-400">
      <span className="animate-bounce [animation-delay:-0.3s]">•</span>
      <span className="animate-bounce [animation-delay:-0.15s]">•</span>
      <span className="animate-bounce">•</span>
    </div>
  );
}; 