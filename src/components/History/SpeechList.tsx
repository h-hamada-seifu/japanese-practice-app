'use client';

import { useState, useMemo } from 'react';
import { SpeechesRow } from '@/types/database';
import SpeechCard from './SpeechCard';

interface SpeechListProps {
  speeches: SpeechesRow[];
}

interface Feedback {
  score?: number;
}

const ITEMS_PER_PAGE = 10;

export default function SpeechList({ speeches }: SpeechListProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedScoreRange, setSelectedScoreRange] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // 話題のユニークリストを取得
  const uniqueTopics = useMemo(() => {
    const topics = speeches.map((speech) => ({
      id: speech.topic_id,
      title: speech.topic_title,
    }));
    const uniqueMap = new Map(topics.map((topic) => [topic.id, topic]));
    return Array.from(uniqueMap.values());
  }, [speeches]);

  // フィルタリング済みの発話リスト
  const filteredSpeeches = useMemo(() => {
    return speeches.filter((speech) => {
      // 話題でフィルタリング
      if (selectedTopic !== 'all' && speech.topic_id !== selectedTopic) {
        return false;
      }

      // スコアでフィルタリング
      if (selectedScoreRange !== 'all') {
        const feedback = speech.feedback as Feedback;
        const score = feedback?.score;

        if (score === undefined) return false;

        switch (selectedScoreRange) {
          case 'high':
            return score >= 80;
          case 'medium':
            return score >= 60 && score < 80;
          case 'low':
            return score < 60;
          default:
            return true;
        }
      }

      return true;
    });
  }, [speeches, selectedTopic, selectedScoreRange]);

  // ページネーション
  const totalPages = Math.ceil(filteredSpeeches.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSpeeches = filteredSpeeches.slice(startIndex, endIndex);

  // ページネーション後の日付グループ
  const paginatedGroupedSpeeches = useMemo(() => {
    const groups: { [date: string]: SpeechesRow[] } = {};

    paginatedSpeeches.forEach((speech) => {
      const date = new Date(speech.created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(speech);
    });

    return groups;
  }, [paginatedSpeeches]);

  const paginatedDates = Object.keys(paginatedGroupedSpeeches).sort((a, b) => {
    const dateA = new Date(paginatedGroupedSpeeches[a][0].created_at);
    const dateB = new Date(paginatedGroupedSpeeches[b][0].created_at);
    return dateB.getTime() - dateA.getTime();
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // フィルタ変更時にページをリセット
  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentPage(1);
  };

  const handleScoreChange = (scoreRange: string) => {
    setSelectedScoreRange(scoreRange);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 話題フィルター */}
          <div>
            <label
              htmlFor="topic-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              話題で絞り込み
            </label>
            <select
              id="topic-filter"
              value={selectedTopic}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべての話題</option>
              {uniqueTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>

          {/* スコアフィルター */}
          <div>
            <label
              htmlFor="score-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              スコアで絞り込み
            </label>
            <select
              id="score-filter"
              value={selectedScoreRange}
              onChange={(e) => handleScoreChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="high">80点以上</option>
              <option value="medium">60〜79点</option>
              <option value="low">60点未満</option>
            </select>
          </div>
        </div>

        {/* 件数表示 */}
        <div className="text-sm text-gray-600">
          {filteredSpeeches.length > 0 ? (
            <>
              全 {speeches.length} 件中 {filteredSpeeches.length} 件を表示
            </>
          ) : (
            '該当する発話履歴がありません'
          )}
        </div>
      </div>

      {/* 発話リスト */}
      {paginatedDates.length > 0 ? (
        <div className="space-y-6">
          {paginatedDates.map((date) => (
            <div key={date}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                {date}
              </h2>
              <div className="space-y-4">
                {paginatedGroupedSpeeches[date].map((speech) => (
                  <SpeechCard key={speech.id} speech={speech} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">条件に一致する発話履歴がありません。</p>
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            前へ
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // 現在のページ前後2ページのみ表示
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-md ${
                      currentPage === page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 3 || page === currentPage + 3) {
                return (
                  <span key={page} className="px-2 py-2">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
