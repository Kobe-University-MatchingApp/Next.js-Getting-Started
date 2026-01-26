"use client";

// ホームのページコンポーネント

import EventCard from '@/app/_components/EventCard';
import { transformSupabaseEventRows } from '@/lib/transformers/eventTransformer';
import { Event } from '@/types/event';
import { useEffect, useState } from 'react';
import { getHomeEvents, getCurrentUserProfile } from '@/lib/home_recommend';
import { Profile } from '@/types/profile';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// フィルターの種類を定義
type FilterType = 'all' | 'languages' | 'tags' | 'upcoming';

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // カテゴリ分けされたデータ
  const [events, setEvents] = useState({
    byLanguages: [] as Event[],
    byTags: [] as Event[],
    upcoming: [] as Event[],
  });

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        // 現在ログインしているユーザーのプロフィールを取得
        const userProfile = await getCurrentUserProfile();

        if (!isMounted) return;

        if (!userProfile) {
          console.error('ユーザープロフィールが見つかりません。ログインページにリダイレクトします。');
          setError('ログインが必要です');
          setTimeout(() => router.push('/login'), 1000);
          return;
        }

        console.log('ユーザープロフィール:', userProfile);

        // ユーザー名と画像を設定
        setUserName(userProfile.name);
        if (userProfile.images && userProfile.images.length > 0) {
          setUserImage(userProfile.images[0]);
        }

        // プロフィール情報に基づいてイベントを取得
        const eventsData = await getHomeEvents(userProfile);
        console.log('取得したイベント:', eventsData);

        if (isMounted) {
          setEvents(eventsData);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        if (isMounted) {
          setError('イベント取得に失敗しました');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    // クリーンアップ：コンポーネントがアンマウントされたらisMountedをfalseにする
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
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
          <h1 className="text-xl font-bold text-gray-800">
            {userName}さんへのおすすめ
          </h1>
        </div>

        {/* --- 絞り込みボタン（2行表示対応） --- */}
        <div className="flex flex-wrap justify-center gap-2 pb-2">
          <FilterButton type="all" label="すべて" />
          <FilterButton type="upcoming" label="✨ 近日中" />
          <FilterButton type="languages" label="🌍 言語が合う" />
          <FilterButton type="tags" label="🎯 趣味が合う" />
        </div>
      </header>

      {/* --- メインコンテンツ --- */}
      <div className="p-4">

        {/* 「すべて」が選択されている時は、順番通りに全セクション表示 */}
        {activeFilter === 'all' && (
          <>
            <EventSection title="✨ 5日以内のおすすめイベント" items={events.upcoming} />
            <EventSection title="🌍 言語が一致するイベント" items={events.byLanguages} />
            <EventSection title="🎯 趣味・興味が一致するイベント" items={events.byTags} />
          </>
        )}

        {/* 個別のフィルターが選択されている時 */}
        {activeFilter === 'upcoming' && <EventSection title="✨ 5日以内のおすすめイベント" items={events.upcoming} />}
        {activeFilter === 'languages' && <EventSection title="🌍 言語が一致するイベント" items={events.byLanguages} />}
        {activeFilter === 'tags' && <EventSection title="🎯 趣味・興味が一致するイベント" items={events.byTags} />}

        {/* データが何もない場合の表示 */}
        {activeFilter !== 'all' &&
          (activeFilter === 'languages' ? events.byLanguages : events.byTags).length === 0 && (
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
    </div>
  );
}