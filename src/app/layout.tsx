import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { BaseLayout } from "@t3chat/components/layout/BaseLayout";
import { ConvexClientProvider } from "@t3chat/providers/ConvexClientProvider";

const montserrat = Nunito_Sans({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "T3 Chat Clone",
  description: "A clone of T3 Chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable}  antialiased`}>
        <ConvexClientProvider>
          <BaseLayout>{children}</BaseLayout>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
