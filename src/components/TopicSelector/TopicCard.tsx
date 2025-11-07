import Link from 'next/link';
import { TopicsRow } from '@/types/database';

export interface TopicCardProps {
  topic: TopicsRow;
}

export default function TopicCard({ topic }: TopicCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {topic.display_order}. {topic.title}
        </h3>
        <p className="text-sm text-gray-600">{topic.description}</p>
      </div>
      <Link
        href={`/record/${topic.id}`}
        className="inline-block px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
      >
        練習する
      </Link>
    </div>
  );
}
