import Link from 'next/link';
import { Plus } from 'lucide-react';

export const NewChatButton = () => {
  return (
    <div className="px-6">
      <Link
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2 text-sm font-semibold text-white transition-all duration-150 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        href="/"
      >
        <Plus size={16} />
        <span>New Chat</span>
      </Link>
    </div>
  );
};
