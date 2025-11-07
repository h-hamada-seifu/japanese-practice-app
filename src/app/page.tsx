import { Suspense } from 'react';
import LoginContent from '@/components/Auth/LoginContent';

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
