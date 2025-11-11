import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function DebugTopicsPage() {
  const supabase = createServerClient();

  // Cookie情報を取得
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  const supabaseCookies = allCookies.filter((cookie) =>
    cookie.name.includes('supabase')
  );

  console.log('=== デバッグ情報 ===');
  console.log('全Cookie数:', allCookies.length);
  console.log(
    'Supabase関連Cookie:',
    supabaseCookies.map((c) => ({ name: c.name, hasValue: !!c.value }))
  );

  // セッション情報を取得
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  console.log('セッション存在:', !!session);
  console.log('セッションエラー:', sessionError);

  // 認証状態の確認
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log('ユーザー存在:', !!user);
  console.log('ユーザーエラー:', userError);

  // RLSを無視してデータ取得を試みる（デバッグ用）
  const { data: allTopics, error: allError } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('topics') as any)
      .select('*')
      .order('display_order', { ascending: true });

  console.log('Topics取得件数:', allTopics?.length || 0);
  console.log('Topicsエラー:', allError);

  // カテゴリー別の件数
  const { data: categoryData, error: categoryError } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('topics') as any)
      .select('category')
      .eq('is_active', true);

  const categoryCounts = categoryData
    ? categoryData.reduce(
        (acc: Record<string, number>, topic: { category: string }) => {
          acc[topic.category] = (acc[topic.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      )
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">デバッグ: Topics データ</h1>

        {/* Cookie情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Cookie情報</h2>
          <div className="space-y-2 text-sm">
            <p>全Cookie数: {allCookies.length}</p>
            <p>Supabase関連Cookie数: {supabaseCookies.length}</p>
            {supabaseCookies.length > 0 && (
              <div className="mt-2 space-y-1">
                {supabaseCookies.map((cookie) => (
                  <div
                    key={cookie.name}
                    className="text-xs bg-gray-50 p-2 rounded"
                  >
                    <p className="font-mono">名前: {cookie.name}</p>
                    <p className="font-mono truncate">
                      値: {cookie.value.substring(0, 50)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* セッション情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">セッション情報</h2>
          {sessionError ? (
            <div className="text-red-600">
              <p>エラー: {sessionError.message}</p>
            </div>
          ) : session ? (
            <div>
              <p className="text-green-600">✅ セッション存在</p>
              <p className="text-sm text-gray-600 mt-2">
                アクセストークン: {session.access_token.substring(0, 20)}...
              </p>
            </div>
          ) : (
            <p className="text-red-600">❌ セッションなし</p>
          )}
        </div>

        {/* 認証状態 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">認証状態</h2>
          {userError ? (
            <div className="text-red-600">
              <p>エラー: {userError.message}</p>
            </div>
          ) : user ? (
            <div>
              <p className="text-green-600">✅ ログイン済み</p>
              <p className="text-sm text-gray-600 mt-2">
                ユーザーID: {user.id}
              </p>
              <p className="text-sm text-gray-600">Email: {user.email}</p>
            </div>
          ) : (
            <p className="text-red-600">❌ 未ログイン</p>
          )}
        </div>

        {/* カテゴリー別件数 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">カテゴリー別件数</h2>
          {categoryError ? (
            <div className="text-red-600">
              <p>エラー: {categoryError.message}</p>
              <pre className="mt-2 text-xs bg-red-50 p-2 rounded">
                {JSON.stringify(categoryError, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="space-y-2">
              {categoryCounts ? (
                <>
                  <p>日常・趣味: {categoryCounts['日常・趣味'] || 0}題</p>
                  <p>説明・経験: {categoryCounts['説明・経験'] || 0}題</p>
                  <p>意見・提案: {categoryCounts['意見・提案'] || 0}題</p>
                  <p className="pt-2 font-bold">
                    合計: {categoryData ? categoryData.length : 0}題
                  </p>
                </>
              ) : (
                <p className="text-gray-500">データがありません</p>
              )}
            </div>
          )}
        </div>

        {/* 全データ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">全トピックデータ</h2>
          {allError ? (
            <div className="text-red-600">
              <p>エラー: {allError.message}</p>
              <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto">
                {JSON.stringify(allError, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                取得件数: {allTopics ? allTopics.length : 0}件
              </p>
              {allTopics && allTopics.length > 0 ? (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-left">カテゴリー</th>
                        <th className="p-2 text-left">タイトル</th>
                        <th className="p-2 text-left">アクティブ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTopics.map(
                        (topic: {
                          id: string;
                          display_order: number;
                          category: string;
                          title: string;
                          is_active: boolean;
                        }) => (
                          <tr key={topic.id} className="border-t">
                            <td className="p-2">{topic.display_order}</td>
                            <td className="p-2">{topic.category}</td>
                            <td className="p-2">{topic.title}</td>
                            <td className="p-2">
                              {topic.is_active ? '✅' : '❌'}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">データがありません</p>
              )}
            </div>
          )}
        </div>

        {/* 環境変数確認 */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">環境変数</h2>
          <div className="space-y-2 text-sm">
            <p>
              NEXT_PUBLIC_SUPABASE_URL:{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_URL
                ? '✅ 設定済み'
                : '❌ 未設定'}
            </p>
            <p>
              NEXT_PUBLIC_SUPABASE_ANON_KEY:{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                ? '✅ 設定済み'
                : '❌ 未設定'}
            </p>
          </div>
        </div>

        {/* デバッグ情報（生JSON） */}
        <div className="bg-gray-100 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">生データ（JSON）</h2>
          <pre className="text-xs overflow-auto bg-white p-4 rounded">
            {JSON.stringify(
              {
                allTopics,
                allError,
                categoryData,
                categoryError,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="mt-6">
          <a
            href="/topics"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            ← 通常のTopicsページへ
          </a>
        </div>
      </div>
    </div>
  );
}
