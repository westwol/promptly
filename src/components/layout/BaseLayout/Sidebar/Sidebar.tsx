import { ChatList } from "./ChatList";
import Link from "next/link";

export const Sidebar = () => {
  return (
    <div className="w-[250px] bg-primary flex flex-col gap-2 h-screen p-4">
      <h1 className="text-white">T3 Chat</h1>
      <Link
        className="bg-red-700 w-full p-2 text-xs rounded-sm text-white shadow-xs cursor-pointer"
        href="/"
      >
        New Chat
      </Link>
      <ChatList />
    </div>
  );
};
