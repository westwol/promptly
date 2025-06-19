import { BaseLayout } from '@t3chat/components/layout/BaseLayout';

import { PropsWithChildren } from 'react';

export default async function RootLayout({ children }: PropsWithChildren) {
  return <BaseLayout>{children}</BaseLayout>;
}
