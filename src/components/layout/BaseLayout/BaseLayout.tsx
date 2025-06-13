"use client";

import { PropsWithChildren } from "react";
import { Sidebar } from "./Sidebar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@t3chat/components/ui/ResizablePanel";
import { Preloaded } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface BaseLayoutProps {
  preloadedConversations: Preloaded<typeof api.conversations.get>;
}

export const BaseLayout = ({
  children,
  preloadedConversations,
}: PropsWithChildren<BaseLayoutProps>) => {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={50}>
        <Sidebar preloadedConversations={preloadedConversations} />
      </ResizablePanel>
      <ResizableHandle className="bg-transparent border-0" withHandle />
      <ResizablePanel defaultSize={80}>
        <div className="bg-[#221D27] h-screen overflow-auto">{children}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
