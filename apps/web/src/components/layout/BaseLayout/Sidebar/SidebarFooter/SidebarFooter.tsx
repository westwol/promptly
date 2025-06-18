import { useAuth } from '@clerk/nextjs';

import { LoggedUserPanel } from './LoggedUserPanel';
import { AuthModal } from './AuthModal';

export const SidebarFooter = () => {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="flex items-center px-6">
      {isLoaded ? (
        isSignedIn ? (
          <LoggedUserPanel />
        ) : (
          <AuthModal />
        )
      ) : (
        <div className="bg-secondary mb-2 flex w-full animate-pulse items-center gap-2 rounded-md p-2">
          <div className="h-8 w-8 rounded-full bg-gray-500" />
          <div className="flex flex-col items-center justify-start gap-1 text-start">
            <div className="h-2 w-22 bg-gray-500" />
            <div className="h-2 w-16 bg-gray-500" />
          </div>
        </div>
      )}
    </div>
  );
};
