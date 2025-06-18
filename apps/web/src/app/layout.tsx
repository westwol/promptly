import './globals.css';

import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { preloadQuery } from 'convex/nextjs';
import { ClerkProvider } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

import { ConvexClientProvider } from '@t3chat/providers/ConvexClientProvider';
import { BaseLayout } from '@t3chat/components/layout/BaseLayout';
import { Toaster } from '@t3chat/components/ui';
import { SessionProvider } from '@t3chat/providers/SessionProvider';
import { api } from '@t3chat-convex/_generated/api';
import { getSessionCookie } from '@t3chat/utils/sessions';
import { LocalDatabaseSyncProvider } from '@t3chat/providers/LocalDatabaseSyncProvider';

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Promptly',
  description: 'A multi-model chatbot platform',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.className} antialiased`}>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <ConvexClientProvider>
            <SessionProvider>
              <LocalDatabaseSyncProvider>
                <Toaster />
                <BaseLayout>{children}</BaseLayout>
              </LocalDatabaseSyncProvider>
            </SessionProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
