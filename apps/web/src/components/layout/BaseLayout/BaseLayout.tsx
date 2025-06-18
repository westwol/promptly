'use client';

import { PropsWithChildren, useRef, useState } from 'react';
import { Preloaded } from 'convex/react';
import { Menu } from 'lucide-react';

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@t3chat/components/ui/ResizablePanel';
import { api } from '@t3chat-convex/_generated/api';
import { ImperativePanelHandle } from 'react-resizable-panels';

import { Sidebar } from './Sidebar';
import { ChatTabs } from './ChatTabs/ChatTabs';

interface BaseLayoutProps {
  preloadedConversations: Preloaded<typeof api.conversations.get>;
}

export const BaseLayout = ({
  children,
  preloadedConversations,
}: PropsWithChildren<BaseLayoutProps>) => {
  const resizablePanel = useRef<ImperativePanelHandle>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const togglePanel = () => {
    if (resizablePanel.current?.isCollapsed()) {
      resizablePanel.current?.expand();
      setIsCollapsed(false);
    } else {
      resizablePanel.current?.collapse();
      setIsCollapsed(true);
    }
  };

  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="panel-animate">
        <ResizablePanel
          id="left-panel"
          ref={resizablePanel}
          collapsible
          defaultSize={17}
          minSize={17}
          maxSize={30}
          className="panel-animate"
          onCollapse={() => setIsCollapsed(true)}
          onExpand={() => setIsCollapsed(false)}
        >
          <Sidebar preloadedConversations={preloadedConversations} />
        </ResizablePanel>
        {!isCollapsed && (
          <ResizableHandle className="bg-secondary handle-animate w-1" />
        )}
        <ResizablePanel
          id="right-panel"
          defaultSize={83}
          className="panel-animate"
        >
          <div className="bg-secondary panel-content relative h-screen overflow-auto">
            <ChatTabs
              isCollapsed={isCollapsed}
              preloadedConversations={preloadedConversations}
            />
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <div className="fixed top-[20px] left-[24px] z-[20] rounded-md">
        <div className="bg-primary flex items-center gap-1 rounded p-1 transition-all duration-200">
          <button
            className="hover:bg-tertiary cursor-pointer rounded-sm p-1.5 transition-colors"
            onClick={togglePanel}
          >
            <Menu color="white" size={20} />
          </button>
        </div>
      </div>
    </>
  );
};
