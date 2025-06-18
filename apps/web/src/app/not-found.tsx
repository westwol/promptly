import { Suspense } from 'react';
import { BaseLayout } from '@t3chat/components/layout/BaseLayout';

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BaseLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-white">404</h1>
            <p className="mb-6 text-gray-400">Page not found</p>
            <a
              href="/"
              className="inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Go back home
            </a>
          </div>
        </div>
      </BaseLayout>
    </Suspense>
  );
}
