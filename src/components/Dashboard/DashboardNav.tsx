'use client';

import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/supabase/auth';

interface DashboardNavProps {
  userEmail: string | null;
}

export default function DashboardNav({ userEmail }: DashboardNavProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              日本語練習アプリ
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              サインアウト
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
