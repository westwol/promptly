import clsx from 'clsx';
import Image from 'next/image';
import { useSignIn } from '@clerk/nextjs';

import { Dialog } from '@t3chat/components/ui';
import { GoogleIcon } from '@t3chat/icons';

const RANDOM_AVATAR_URL = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${Math.random()}&flip=false`;

export const AuthModal = () => {
  const { signIn, isLoaded } = useSignIn();

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

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="hover:bg-tertiary mb-2 flex w-full items-center gap-2 rounded-md border-transparent p-2 text-start text-white outline-0 hover:shadow-md">
          <Image
            alt="avatar"
            height={32}
            width={32}
            src={RANDOM_AVATAR_URL}
            className="rounded-full"
            unoptimized
          />
          <div className="flex flex-col">
            <span className="text-sm">Anonymous</span>
            <span className="text-xs text-gray-400">Limited</span>
          </div>
        </button>
      </Dialog.Trigger>
      <Dialog.Content className="outline-none sm:max-w-[425px]">
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
              'bg-secondary flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2.5 font-bold shadow-sm transition-colors duration-200',
              'focus:ring-tertiary/30 hover:opacity-80 focus:border-0 focus:ring-2 focus:outline-none'
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
