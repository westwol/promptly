"use client";

import { PropsWithChildren } from "react";
import { Sidebar } from "./Sidebar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@t3chat/components/ui/ResizablePanel";

export const BaseLayout = ({ children }: PropsWithChildren) => {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={50}>
        <Sidebar />
      </ResizablePanel>
      <ResizableHandle className="bg-transparent border-0" withHandle />
      <ResizablePanel defaultSize={80}>
        <div className="bg-[#221D27] h-screen overflow-auto">{children}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
