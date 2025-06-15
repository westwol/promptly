import './globals.css';

import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { preloadQuery } from 'convex/nextjs';
import { ClerkProvider } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

import { ConvexClientProvider } from '@t3chat/providers/ConvexClientProvider';
import { BaseLayout } from '@t3chat/components/layout/BaseLayout';
import { SessionProvider } from '@t3chat/components/providers/SessionProvider';

import { api } from '../../convex/_generated/api';
import { getSessionCookie } from '@t3chat/utils/sessions';

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'T3 Chat Clone',
  description: 'A clone of T3 Chat',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, anonymousSessionId] = await Promise.all([auth(), getSessionCookie()]);
  const sessionId = user.userId ?? anonymousSessionId;
  const conversations = await preloadQuery(api.conversations.get, { sessionId });

  return (
    <html lang="en">
      <body className={`${nunitoSans.className} antialiased`}>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <ConvexClientProvider>
            <SessionProvider sessionId={sessionId}>
              <BaseLayout preloadedConversations={conversations}>{children}</BaseLayout>
            </SessionProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
