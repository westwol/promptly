import clsx from 'clsx';
import { useAuth, useSignIn, useClerk } from '@clerk/nextjs';

import { Dialog } from '@t3chat/components/ui';
import { GoogleIcon } from '@t3chat/icons';

export const AuthModal = () => {
  const { isSignedIn } = useAuth();
  const { signIn, isLoaded } = useSignIn();
  const { signOut } = useClerk();

  const onGoogleSignIn = async () => {
    if (!isLoaded) {
      return;
    }
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sign-in/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err) {
      console.error('OAuth error', err);
    }
  };

  const onGoogleLogout = async () => {
    if (!isLoaded) {
      return;
    }
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  return isSignedIn ? (
    <button
      onClick={onGoogleLogout}
      className={clsx(
        'hover:bg-secondary/20 flex w-full cursor-pointer justify-center rounded-md py-2 shadow-sm transition-colors duration-200 hover:font-bold',
        'hover:opacity-80 focus:border-0 focus:ring-2 focus:ring-red-900/30 focus:outline-none'
      )}
    >
      Logout
    </button>
  ) : (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className={clsx(
            'hover:bg-secondary/20 flex w-full cursor-pointer justify-center rounded-md py-2 shadow-sm transition-colors duration-200 hover:font-bold',
            'hover:opacity-80 focus:border-0 focus:ring-2 focus:ring-red-900/30 focus:outline-none'
          )}
        >
          Sign in
        </button>
      </Dialog.Trigger>
      <Dialog.Content className="sm:max-w-[425px]">
        <Dialog.Header>
          <Dialog.Title>Sign in to your account</Dialog.Title>
          <Dialog.Title className="text-muted text-sm">
            To provide you a better experience, please sign in to your account
          </Dialog.Title>
        </Dialog.Header>
        <div className="flex w-full flex-col gap-2">
          <button
            onClick={onGoogleSignIn}
            className={clsx(
              'bg-secondary/20 flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2.5 font-bold shadow-sm transition-colors duration-200',
              'hover:opacity-80 focus:border-0 focus:ring-2 focus:ring-red-900/30 focus:outline-none'
            )}
          >
            <GoogleIcon className="h-5 w-5" />
            Continue with Google
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
