import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@t3chat/providers/ConvexClientProvider";
import { preloadQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { BaseLayout } from "@t3chat/components/layout/BaseLayout";

const montserrat = Nunito_Sans({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "T3 Chat Clone",
  description: "A clone of T3 Chat",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const conversations = await preloadQuery(api.conversations.get);
  return (
    <html lang="en">
      <body className={`${montserrat.variable}  antialiased`}>
        <ConvexClientProvider>
          <BaseLayout preloadedConversations={conversations}>
            {children}
          </BaseLayout>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
