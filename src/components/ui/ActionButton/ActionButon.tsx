import { ComponentProps } from "react";

interface ActionButtonProps extends ComponentProps<"button"> {
  disabled?: boolean;
}

export const ActionButton = ({
  children,
  disabled,
  ...htmlButtonProps
}: ActionButtonProps) => {
  return (
    <button
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 z-10 h-8 w-8 text-muted-foreground"
      data-sidebar="trigger"
      disabled={disabled}
      {...htmlButtonProps}
    >
      {children}
    </button>
  );
};
