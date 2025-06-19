'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@t3chat/components/ui/ResizablePanel';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { useIsMobile } from '@t3chat/hooks/useIsMobile';

import { Sidebar } from './Sidebar';
import { ChatTabs } from './ChatTabs';
import Image from 'next/image';

export const BaseLayout = ({ children }: PropsWithChildren) => {
  const resizablePanel = useRef<ImperativePanelHandle>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isMobile = useIsMobile();

  const togglePanel = () => {
    if (resizablePanel.current?.isCollapsed()) {
      resizablePanel.current?.expand();
      setIsCollapsed(false);
    } else {
      resizablePanel.current?.collapse();
      setIsCollapsed(true);
    }
  };

  useEffect(() => {
    if (isMobile) {
      resizablePanel.current?.collapse();
    } else {
      resizablePanel.current?.expand();
    }
  }, [isMobile]);

  // For mobile overlay, we need to handle the panel state differently
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const toggleMobilePanel = () => {
    setIsMobilePanelOpen(!isMobilePanelOpen);
  };

  // Close mobile panel when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobilePanelOpen(false);
    }
  }, [isMobile]);

  if (isMobile) {
    return (
      <>
        {/* Mobile Layout */}
        <div className="relative h-screen w-full">
          <div className="bg-secondary panel-content relative h-screen w-full overflow-auto">
            <ChatTabs isCollapsed={true} />
            {children}
          </div>

          {/* Mobile menu button */}
          <div className="hover:bg-primary/80 fixed top-[5px] left-[10px] z-[20] block rounded-md xl:hidden">
            <button
              className="m-0 cursor-pointer rounded-sm p-1.5 transition-colors"
              onClick={toggleMobilePanel}
            >
              <Menu color="white" size={20} />
            </button>
          </div>

          {/* Backdrop overlay */}
          {isMobilePanelOpen && (
            <div
              className="fixed inset-0 z-[40] bg-black/50 transition-opacity"
              onClick={toggleMobilePanel}
            />
          )}

          {/* Mobile sidebar overlay */}
          <div
            className={`fixed top-0 left-0 z-[50] h-full w-80 transform transition-transform duration-300 ease-in-out ${
              isMobilePanelOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="bg-primary relative h-full w-full shadow-xl">
              {/* Close button */}
              <div className="fixed top-2 right-4 z-[60]">
                <button
                  className="bg-primary hover:bg-primary/80 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                  onClick={toggleMobilePanel}
                >
                  <X color="white" size={16} />
                </button>
              </div>

              {/* Sidebar content */}
              <div className="h-full w-full pt-2">
                <Sidebar />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop Layout - unchanged */}
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
          <Sidebar />
        </ResizablePanel>
        {!isCollapsed && <ResizableHandle className="bg-secondary handle-animate w-1" />}
        <ResizablePanel id="right-panel" defaultSize={83} className="panel-animate">
          <div className="bg-secondary panel-content relative h-screen overflow-auto">
            <ChatTabs isCollapsed={isCollapsed} />
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <div className="fixed top-[20px] left-[15px] z-[20] hidden rounded-md xl:block">
        <div className="bg-primary flex flex-col items-center gap-1 rounded p-1 transition-all duration-200">
          {isCollapsed && <Image width={45} height={45} src="/logo.png" alt="logo" />}
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
