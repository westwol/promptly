import { ChatList } from "./ChatList";

export const Sidebar = () => {
  return (
    <div className="w-[250px] bg-primary flex flex-col gap-2 h-screen p-4">
      <h1 className="text-white">T3 Chat</h1>
      <button className="bg-red-700 w-full p-2 text-xs rounded-sm text-white shadow-xs cursor-pointer">
        New Chat
      </button>
      <ChatList />
    </div>
  );
};
