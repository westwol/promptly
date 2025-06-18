import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';

import { Popover } from '@t3chat/components/ui';
import { db } from '@t3chat/lib/db';

import { CustomApiKeyModal } from './CustomApiKeyModal';
import { useSessionStore } from '@t3chat/store/session';
import { ANONYMOUS_LOCAL_STORAGE_IDENTIFIER } from '@t3chat/providers/SessionProvider/SessionProvider';

export const LoggedUserPanel = () => {
  const setSessionId = useSessionStore((state) => state.setSessionId);
  const { signOut, user } = useClerk();

  const onLogout = async () => {
    try {
      const anonymousLocalStorageId =
        localStorage.getItem(ANONYMOUS_LOCAL_STORAGE_IDENTIFIER) || uuidv4();
      await signOut();
      setSessionId(anonymousLocalStorageId);
      db.conversations.clear();
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="hover:bg-tertiary mb-2 flex w-full items-center gap-2 rounded-md border-transparent p-2 text-start text-white hover:shadow-md">
          <Image
            alt="avatar"
            height={32}
            width={32}
            src={user?.imageUrl || ''}
            className="rounded-full"
            unoptimized
          />
          <div className="flex flex-col">
            <span className="text-sm">{user?.fullName}</span>
            <span className="text-xs text-gray-400">Pro</span>
          </div>
        </button>
      </Popover.Trigger>
      <Popover.Content
        side="top"
        align="start"
        sideOffset={5}
        className="bg-secondary w-[var(--radix-popover-trigger-width)] border-0 p-1.5 outline-none"
      >
        <ul>
          <CustomApiKeyModal />
          <li
            className="hover:bg-primary flex items-center gap-2 rounded-md p-2 text-sm transition-all hover:opacity-70"
            onClick={onLogout}
          >
            <LogOut size={12} />
            <span>Logout</span>
          </li>
        </ul>
      </Popover.Content>
    </Popover.Root>
  );
};
