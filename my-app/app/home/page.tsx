"use client";

// ホームのページコンポーネント

import EventCard from '@/app/_components/EventCard';
import { supabase } from '@/lib/supabaseClient';
import { transformSupabaseEventRows } from '@/lib/transformers/eventTransformer';
import { Event } from '@/types/event';
import { useEffect, useState } from 'react';
import { getHomeEvents, getCurrentUserName } from '@/lib/home_recommend';
import Link from 'next/link';

// フィルターの種類を定義
type FilterType = 'all' | 'tags' | 'history' | 'faculty' | 'upcoming';

export default function HomePage() {
  const [userName, setUserName] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [bookedEvents, setBookedEvents] = useState<Event[]>([]);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);

  // カテゴリ分けされたデータ
  const [events, setEvents] = useState({
    byTags: [] as Event[],
    byHistory: [] as Event[],
    byFaculty: [] as Event[],
    byUpcoming: [] as Event[],
  });

  useEffect(() => {
    const fetchEvents = async () => {
      setUserName(getCurrentUserName());
      const eventsData = await getHomeEvents();
      setEvents(eventsData);
    };
    fetchEvents();
  }, []);

  // フィルターボタンのコンポーネント
  const FilterButton = ({ type, label }: { type: FilterType; label: string }) => (
    <button
      onClick={() => setActiveFilter(type)}
      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === type
        ? 'bg-purple-600 text-white shadow-md'
        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
        }`}
    >
      {label}
    </button>
  );

  // セクションを表示するコンポーネント
  const EventSection = ({ title, items }: { title: string; items: Event[] }) => {
    if (items.length === 0) return null;
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>
        <div className="flex flex-col gap-4">
          {items.map((event) => (
            // EventCard内部で既にLinkでラップされているため、ここでは不要
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* --- ヘッダーエリア --- */}
      <header className="bg-white px-4 py-4 shadow-sm sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">{userName}さんへのおすすめ</h1>
          <button
            onClick={() => setIsBookmarkModalOpen(true)}
            className="flex flex-col items-center gap-1 hover:opacity-80 transition-all"
            aria-label="予約済みイベント"
          >
            <div className="relative w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center border border-purple-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {/* 通知バッジ */}
              <span className="absolute -top-1 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </div>
            <span className="text-xs text-gray-600">予約確認</span>
          </button>
        </div>

        {/* --- 絞り込みボタン（2行表示対応） --- */}
        <div className="flex flex-wrap justify-center gap-2 pb-2">
          <FilterButton type="all" label="すべて" />
          <FilterButton type="tags" label="🎯 興味タグ" />
          <FilterButton type="history" label="📚 過去の履歴" />
          <FilterButton type="faculty" label="🏫 学部のおすすめ" />
          <FilterButton type="upcoming" label="🔥 開催間近" />
        </div>
      </header>

      {/* --- メインコンテンツ --- */}
      <div className="p-4">

        {/* 「すべて」が選択されている時は、順番通りに全セクション表示 */}
        {activeFilter === 'all' && (
          <>
            <EventSection title="あなたの興味・関心" items={events.byTags} />
            <EventSection title="過去の履歴からのおすすめ" items={events.byHistory} />
            <EventSection title="同じ学部・学科で人気" items={events.byFaculty} />
            <EventSection title="開催間近のイベント" items={events.byUpcoming} />

            {/* どの条件にも合わなかったイベントを表示したい場合はここに追加 */}
          </>
        )}

        {/* 個別のフィルターが選択されている時 */}
        {activeFilter === 'tags' && <EventSection title="興味タグにマッチ" items={events.byTags} />}
        {activeFilter === 'history' && <EventSection title="過去の履歴に関連" items={events.byHistory} />}
        {activeFilter === 'faculty' && <EventSection title="同じ学部・学科の人へ" items={events.byFaculty} />}
        {activeFilter === 'upcoming' && <EventSection title="開催間近！参加者募集中" items={events.byUpcoming} />}

        {/* データが何もない場合の表示 */}
        {activeFilter !== 'all' &&
          events[activeFilter === 'tags' ? 'byTags' :
            activeFilter === 'history' ? 'byHistory' :
              activeFilter === 'faculty' ? 'byFaculty' : 'byUpcoming'].length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm mb-2">該当するイベントはありませんでした。</p>
              <br />
              <p className="text-gray-600 text-sm mb-4">イベントを作成してみませんか？</p>
              <Link
                href="/create"
                className="inline-block px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                イベントを作成する
              </Link>
            </div>
          )}

      </div>

      {/* 予約済みイベントモーダル */}
      {isBookmarkModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-2xl min-h-[50vh] max-h-[95vh] overflow-y-auto">
            {/* モーダルヘッダー */}
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-800">予約済みイベント</h2>
              </div>
              <button
                onClick={() => setIsBookmarkModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div className="p-4 space-y-4">
              {bookedEvents.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  予約済みのイベントはありません
                </div>
              ) : (
                <>
                  {bookedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}