'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

interface TeacherLayoutProps {
  children: React.ReactNode;
  teacherName?: string;
}

export default function TeacherLayout({
  children,
  teacherName,
}: TeacherLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const navItems = [
    { href: '/teacher/dashboard', label: 'ダッシュボード', icon: '📊' },
    { href: '/teacher/classes', label: '担当クラス', icon: '📚' },
    { href: '/teacher/students', label: '全生徒一覧', icon: '👥' },
    { href: '/teacher/analytics', label: '統計分析', icon: '📈' },
    { href: '/teacher/alerts', label: '通知', icon: '🔔' },
    { href: '/teacher/reports', label: 'レポート', icon: '📊' },
    { href: '/teacher/settings', label: '設定', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 固定サイドバー（240px） */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-800">
            📚 日本語練習アプリ
          </h1>
          <p className="text-sm text-gray-600 mt-1">講師ダッシュボード</p>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* クイックアクセス */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              クイックアクセス
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/teacher/students?status=inactive"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <span>🔴</span>
                  <span>要注意生徒</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/students?status=warning"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                >
                  <span>⚠️</span>
                  <span>停滞生徒</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* ユーザー情報 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {teacherName || '講師'}
              </p>
              <p className="text-xs text-gray-500">講師アカウント</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            サインアウト
          </button>
        </div>
      </aside>

      {/* メインコンテンツエリア */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
