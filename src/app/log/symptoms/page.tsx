'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SymptomLoggerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Aafiya chat with symptom check-in intent
    router.replace('/?checkin=symptoms');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '200ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '400ms' }} />
      </div>
    </div>
  );
}
