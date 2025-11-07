import { createServerClient } from '@/lib/supabase/server';
import TopicCard from '@/components/TopicSelector/TopicCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    category: string;
  };
}

const validCategories = ['日常・趣味', '説明・経験', '意見・提案'];

async function getTopicsByCategory(category: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching topics:', error);
    return [];
  }

  return data || [];
}

export default async function CategoryTopicsPage({ params }: PageProps) {
  const decodedCategory = decodeURIComponent(params.category);

  if (!validCategories.includes(decodedCategory)) {
    notFound();
  }

  const topics = await getTopicsByCategory(decodedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        <header className="mb-6">
          <Link
            href="/topics"
            className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            <span>←</span>
            <span>{decodedCategory}</span>
          </Link>
        </header>

        <div className="space-y-4">
          {topics.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">話題が見つかりませんでした</p>
            </div>
          ) : (
            topics.map((topic) => <TopicCard key={topic.id} topic={topic} />)
          )}
        </div>
      </div>
    </div>
  );
}
