"use client";

import { useEffect, useState } from 'react';
import EventCard from '@/app/_components/EventCard';
import { getHomeEvents, getCurrentUserName, FilterType, CategorizedEvents } from '@/lib/home';
import { Event } from '@/types/event';

// フィルターボタンコンポーネント
interface FilterButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

function FilterButton({ label, isActive, onClick }: FilterButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${isActive
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
        >
            {label}
        </button>
    );
}

// イベントセクションコンポーネント
interface EventSectionProps {
    title: string;
    events: Event[];
    icon?: string;
}

function EventSection({ title, events, icon }: EventSectionProps) {
    if (events.length === 0) return null;

    return (
        <div className="bg-white border-b border-gray-200 p-4 mx-0">
            <div className="flex items-center mb-3">
                <div className="w-1 h-6 bg-blue-500 mr-3 rounded"></div>
                <h2 className="text-lg font-semibold text-gray-800">
                    {icon && <span className="mr-2">{icon}</span>}
                    {title}
                </h2>
            </div>
            <div className="space-y-2">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
}

export default function HomePage() {
    const [userName, setUserName] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [events, setEvents] = useState<CategorizedEvents>({
        all: [],
        interests: [],
        history: [],
        department: [],
        upcoming: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [name, homeEvents] = await Promise.all([
                    getCurrentUserName(),
                    getHomeEvents()
                ]);
                setUserName(name);
                setEvents(homeEvents);
            } catch (error) {
                console.error('データ取得エラー:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // フィルター設定
    const filters = [
        { key: 'all' as FilterType, label: 'すべて' },
        { key: 'interests' as FilterType, label: '🎯 興味タグ' },
        { key: 'history' as FilterType, label: '📚 過去の履歴' },
        { key: 'department' as FilterType, label: '🏫 学部のおすすめ' },
        { key: 'upcoming' as FilterType, label: '🔥 開催間近' }
    ];

    // 表示するイベントを選択
    const displayEvents = events[activeFilter];

    return (
        <div className="min-h-screen pb-20">
            {/* ヘッダー */}
            <div className="bg-white border-b border-gray-200 p-4 mx-0 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">ホーム</h1>
                        <p className="text-sm text-gray-600 mt-1">こんにちは、{userName}さん</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {userName.charAt(0)}
                    </div>
                </div>

                {/* フィルターボタン */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {filters.map((filter) => (
                        <FilterButton
                            key={filter.key}
                            label={filter.label}
                            isActive={activeFilter === filter.key}
                            onClick={() => setActiveFilter(filter.key)}
                        />
                    ))}
                </div>
            </div>

            {/* ローディング状態 */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">読み込み中...</div>
                </div>
            ) : (
                <div className="space-y-0">
                    {/* すべて表示の場合は各カテゴリを表示 */}
                    {activeFilter === 'all' ? (
                        <>
                            <EventSection title="🎯 興味タグに基づく推奨" events={events.interests} />
                            <EventSection title="📚 過去の履歴から" events={events.history} />
                            <EventSection title="🏫 学部のおすすめ" events={events.department} />
                            <EventSection title="🔥 開催間近のイベント" events={events.upcoming} />
                        </>
                    ) : (
                        /* 特定のフィルターが選択されている場合 */
                        <div className="bg-white border-b border-gray-200 p-4 mx-0">
                            <div className="space-y-2">
                                {displayEvents.length > 0 ? (
                                    displayEvents.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        イベントが見つかりませんでした
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
