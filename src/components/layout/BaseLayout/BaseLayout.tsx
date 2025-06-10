import { PropsWithChildren } from "react";
import { Sidebar } from "./Sidebar";
import { ChatConversation } from "@t3chat/components/ChatConversation";

export const BaseLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="grid grid-cols-[auto_1fr]">
      <Sidebar />
      <div className="bg-[#221D27]">
        <ChatConversation />
      </div>
    </div>
  );
};
