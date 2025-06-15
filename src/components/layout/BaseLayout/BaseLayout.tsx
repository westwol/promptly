'use client';

import { PropsWithChildren } from 'react';
import { Sidebar } from './Sidebar';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@t3chat/components/ui/ResizablePanel';
import { Preloaded } from 'convex/react';
import { api } from '@t3chat-convex/_generated/api';

interface BaseLayoutProps {
  preloadedConversations: Preloaded<typeof api.conversations.get>;
}

export const BaseLayout = ({
  children,
  preloadedConversations,
}: PropsWithChildren<BaseLayoutProps>) => {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={17} minSize={17} maxSize={50}>
        <Sidebar preloadedConversations={preloadedConversations} />
      </ResizablePanel>
      <ResizableHandle className="border-0 bg-transparent" withHandle />
      <ResizablePanel defaultSize={80}>
        <div className="bg-secondary h-screen overflow-auto">{children}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
