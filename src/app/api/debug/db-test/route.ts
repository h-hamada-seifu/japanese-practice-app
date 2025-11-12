import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerClient();

    console.log('[DB Test] Creating Supabase client...');

    // 1. 認証状態の確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('[DB Test] Auth check:', {
      hasUser: !!user,
      userEmail: user?.email,
      authError: authError?.message
    });

    // 2. テーブルの存在確認
    const { data: tables, error: tablesError } = await supabase
      .from('topics')
      .select('*')
      .limit(1);

    console.log('[DB Test] Table query result:', {
      hasData: !!tables,
      dataCount: tables?.length || 0,
      error: tablesError?.message,
      errorDetails: tablesError
    });

    // 3. 全カテゴリーのカウント取得
    const categories = ['日常・趣味', '説明・経験', '意見・提案'];
    const categoryResults = [];

    for (const category of categories) {
      const { count, data, error } = await supabase
        .from('topics')
        .select('*', { count: 'exact', head: false })
        .eq('category', category)
        .eq('is_active', true);

      categoryResults.push({
        category,
        count,
        hasData: !!data,
        dataLength: data?.length || 0,
        error: error?.message,
        errorCode: error?.code,
        errorHint: error?.hint
      });

      console.log(`[DB Test] Category ${category}:`, {
        count,
        dataLength: data?.length || 0,
        error: error?.message
      });
    }

    // 4. RLSポリシーの確認用：全データ取得
    const { data: allTopics, error: allError } = await supabase
      .from('topics')
      .select('*');

    console.log('[DB Test] All topics query:', {
      hasData: !!allTopics,
      dataCount: allTopics?.length || 0,
      error: allError?.message,
      errorDetails: allError
    });

    // 5. Supabase URLとAnon Keyの存在確認（値は隠す）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseKey,
        supabaseUrlStart: supabaseUrl?.substring(0, 30) + '...',
      },
      auth: {
        isAuthenticated: !!user,
        userEmail: user?.email || null,
        authError: authError?.message || null,
      },
      database: {
        tableCheck: {
          success: !tablesError,
          error: tablesError?.message || null,
          errorCode: tablesError?.code || null,
          dataCount: tables?.length || 0,
        },
        categoryResults,
        allTopics: {
          success: !allError,
          count: allTopics?.length || 0,
          error: allError?.message || null,
          errorCode: allError?.code || null,
          errorHint: allError?.hint || null,
        },
      },
      diagnostics: {
        possibleIssues: [],
      },
    };

    // 診断結果を追加
    if (!user) {
      response.diagnostics.possibleIssues.push('User not authenticated');
    }
    if (tablesError?.code === '42P01') {
      response.diagnostics.possibleIssues.push('Table "topics" does not exist');
    }
    if (tablesError?.code === '42501') {
      response.diagnostics.possibleIssues.push('RLS policy blocking access');
    }
    if (allTopics?.length === 0 && !allError) {
      response.diagnostics.possibleIssues.push('Table exists but contains no data');
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[DB Test] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}