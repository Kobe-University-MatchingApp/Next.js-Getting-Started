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
      className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
        activeFilter === type
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
           {/* 装飾用のバー */}
          <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>
        <div className="flex flex-col gap-4">
          {items.map((event) => (
            // 「探す」画面と同じ形式で表示するためにLinkで囲む
            <Link href={`/find/${event.id}`} key={event.id} className="block hover:opacity-95 transition-opacity">
               {/* 既存のEventCardを使用 */}
               <EventCard event={event} />
            </Link>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* --- ヘッダーエリア --- */}
      <header className="bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">こんにちは、{userName}さん</h1>
          <Link href="/profile" className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
            <img src="https://i.pravatar.cc/100" alt="profile" className="w-full h-full object-cover" />
          </Link>
        </div>

        <div className="py-3 space-y-3 pb-20">
            {/* アプリタイトル */}
            <div className="bg-white rounded-lg shadow-sm p-4 mx-2">
                <h1 className="text-xl font-bold text-gray-800 mb-2">アプリタイトル - ホーム</h1>
            </div>

            {/* マッチング結果 */}
            <div className="bg-white rounded-lg shadow-sm p-4 mx-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">マッチングしたおすすめなイベント</h2>    
            </div>
        </div>

        {/* --- 絞り込みボタン（横スクロール） --- */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
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
          <div className="text-center py-10 text-gray-500 text-sm">
            該当するイベントはありませんでした。
          </div>
        )}

      </div>
      
      {/* 予約済みイベント */}
      <div className="bg-white rounded-lg shadow-sm p-4 mx-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">予約済みイベント</h2>
            <div className="space-y-2">
                    {bookedEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
            </div>
      </div>
    </div>
  );
}