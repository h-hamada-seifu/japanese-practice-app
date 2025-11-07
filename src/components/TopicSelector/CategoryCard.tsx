import Link from 'next/link';

export interface CategoryCardProps {
  category: '日常・趣味' | '説明・経験' | '意見・提案';
  emoji: string;
  description: string;
  topicCount: number;
}

const categoryColors = {
  '日常・趣味': 'bg-blue-50 hover:bg-blue-100 border-blue-200',
  '説明・経験': 'bg-green-50 hover:bg-green-100 border-green-200',
  '意見・提案': 'bg-purple-50 hover:bg-purple-100 border-purple-200',
};

export default function CategoryCard({
  category,
  emoji,
  description,
  topicCount,
}: CategoryCardProps) {
  const colorClass = categoryColors[category];

  return (
    <Link href={`/topics/${encodeURIComponent(category)}`}>
      <div
        className={`p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer ${colorClass}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label={category}>
              {emoji}
            </span>
            <h2 className="text-xl font-bold text-gray-800">{category}</h2>
          </div>
        </div>
        <p className="text-gray-600 mb-4 text-sm">{description}</p>
        <div className="border-t border-gray-300 pt-3">
          <p className="text-sm text-gray-500">[{topicCount}題]</p>
        </div>
      </div>
    </Link>
  );
}
