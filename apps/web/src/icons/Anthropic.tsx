import { cn } from "@t3chat/lib/utils";

export const AnthropicIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 46 32"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className={cn("size-4 text-color-heading", className)}
  >
    <title>Anthropic</title>
    <path d="M32.73 0h-6.945L38.45 32h6.945L32.73 0ZM12.665 0 0 32h7.082l2.59-6.72h13.25l2.59 6.72h7.082L19.929 0h-7.264Zm-.702 19.337 4.334-11.246 4.334 11.246h-8.668Z"></path>
  </svg>
);
