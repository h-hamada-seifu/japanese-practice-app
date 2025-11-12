import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// シードデータ
const topicsData = [
  // 日常・趣味カテゴリー
  {
    category: '日常・趣味',
    topic_text: '好きな食べ物について話してください',
    hint_text: 'どんな料理が好きですか？なぜ好きですか？',
    difficulty: 1,
    is_active: true,
  },
  {
    category: '日常・趣味',
    topic_text: '週末の過ごし方について話してください',
    hint_text: '普段の週末は何をしていますか？',
    difficulty: 1,
    is_active: true,
  },
  {
    category: '日常・趣味',
    topic_text: '好きな季節について話してください',
    hint_text: 'どの季節が好きですか？その理由は？',
    difficulty: 1,
    is_active: true,
  },
  {
    category: '日常・趣味',
    topic_text: '趣味について話してください',
    hint_text: 'どんな趣味を持っていますか？いつから始めましたか？',
    difficulty: 2,
    is_active: true,
  },
  {
    category: '日常・趣味',
    topic_text: '最近見た映画やドラマについて話してください',
    hint_text: 'どんな内容でしたか？感想は？',
    difficulty: 2,
    is_active: true,
  },
  // 説明・経験カテゴリー
  {
    category: '説明・経験',
    topic_text: '自分の仕事や学校について説明してください',
    hint_text: 'どんなことをしていますか？典型的な一日は？',
    difficulty: 2,
    is_active: true,
  },
  {
    category: '説明・経験',
    topic_text: '最近の楽しかった出来事について話してください',
    hint_text: 'いつ、どこで、何があった？',
    difficulty: 2,
    is_active: true,
  },
  {
    category: '説明・経験',
    topic_text: '子供の頃の思い出について話してください',
    hint_text: 'どんな思い出がありますか？',
    difficulty: 3,
    is_active: true,
  },
  {
    category: '説明・経験',
    topic_text: '旅行の経験について話してください',
    hint_text: 'どこへ行きましたか？何が印象的でしたか？',
    difficulty: 2,
    is_active: true,
  },
  {
    category: '説明・経験',
    topic_text: '失敗から学んだことについて話してください',
    hint_text: 'どんな失敗？何を学びましたか？',
    difficulty: 3,
    is_active: true,
  },
  // 意見・提案カテゴリー
  {
    category: '意見・提案',
    topic_text: '環境問題についてあなたの意見を聞かせてください',
    hint_text: 'どんな問題が重要？解決策は？',
    difficulty: 3,
    is_active: true,
  },
  {
    category: '意見・提案',
    topic_text: '理想の休日の過ごし方を提案してください',
    hint_text: 'どんな活動？なぜおすすめ？',
    difficulty: 2,
    is_active: true,
  },
  {
    category: '意見・提案',
    topic_text: '健康的な生活のためのアドバイスをください',
    hint_text: '食事、運動、睡眠などについて',
    difficulty: 2,
    is_active: true,
  },
  {
    category: '意見・提案',
    topic_text: 'AIやテクノロジーの未来について意見を聞かせてください',
    hint_text: 'どんな変化が起こる？良い点と悪い点は？',
    difficulty: 3,
    is_active: true,
  },
  {
    category: '意見・提案',
    topic_text: '外国語学習の効果的な方法を提案してください',
    hint_text: 'どんな方法が効果的？なぜ？',
    difficulty: 3,
    is_active: true,
  },
];

export async function POST() {
  try {
    const supabase = createServerClient();

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'Please login first',
        },
        { status: 401 }
      );
    }

    // 既存のデータをチェック
    const { count: existingCount } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true });

    if (existingCount && existingCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Topics table already has ${existingCount} records. Clear table first if you want to reseed.`,
        existingCount,
      });
    }

    // データを挿入
    const { error } = await supabase.from('topics').insert(topicsData);

    if (error) {
      console.error('[Seed Topics] Insert error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorCode: error.code,
          errorDetails: error,
        },
        { status: 500 }
      );
    }

    // 挿入後のカウントを確認
    const categoryCounts: Record<string, number> = {};
    for (const category of ['日常・趣味', '説明・経験', '意見・提案']) {
      const { count } = await supabase
        .from('topics')
        .select('*', { count: 'exact', head: true })
        .eq('category', category)
        .eq('is_active', true);

      categoryCounts[category] = count || 0;
    }

    return NextResponse.json({
      success: true,
      message: 'Topics seeded successfully',
      insertedCount: topicsData.length,
      categoryCounts,
    });
  } catch (error) {
    console.error('[Seed Topics] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE メソッドでテーブルをクリア
export async function DELETE() {
  try {
    const supabase = createServerClient();

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // すべてのトピックを削除
    const { error } = await supabase.from('topics').delete().neq('id', 0); // id != 0 ですべて削除

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'All topics deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
