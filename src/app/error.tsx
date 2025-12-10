'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error do monitoring služby
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h2 className="text-2xl font-bold mb-4">Něco se pokazilo</h2>
      <p className="text-gray-600 mb-8">Omlouváme se za komplikace.</p>
      <button
        onClick={reset}
        className="bg-primary text-black px-6 py-3 rounded font-medium hover:bg-primary-hover transition-colors"
      >
        Zkusit znovu
      </button>
    </div>
  );
}
