import { createServerClient } from '@/lib/supabase/server';
import CategoryCard from '@/components/TopicSelector/CategoryCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface CategoryInfo {
  category: '日常・趣味' | '説明・経験' | '意見・提案';
  emoji: string;
  description: string;
}

const categories: CategoryInfo[] = [
  {
    category: '日常・趣味',
    emoji: '🍜',
    description: '気軽に話せる話題',
  },
  {
    category: '説明・経験',
    emoji: '🗾',
    description: '少し考える話題',
  },
  {
    category: '意見・提案',
    emoji: '💡',
    description: '自分の考えを話す',
  },
];

async function getTopicCounts() {
  const supabase = createServerClient();
  const counts: Record<string, number> = {};

  for (const cat of categories) {
    const { count, error } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .eq('category', cat.category)
      .eq('is_active', true);

    if (error) {
      console.error(`Error fetching count for ${cat.category}:`, error);
      counts[cat.category] = 0;
    } else {
      counts[cat.category] = count || 0;
    }
  }

  return counts;
}

export default async function TopicsPage() {
  const topicCounts = await getTopicCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        <header className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            <span>←</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-700">
            [プロフィール]
          </h1>
        </header>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            カテゴリーを選んでね
          </h2>
        </div>

        <div className="space-y-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.category}
              category={cat.category}
              emoji={cat.emoji}
              description={cat.description}
              topicCount={topicCounts[cat.category] || 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
