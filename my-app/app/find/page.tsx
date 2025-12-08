'use client';

import { useState } from 'react';
import { Event, EventCategory } from '@/types/event';
import Link from 'next/link';

// サンプルデータ
const sampleEvents: Event[] = [
    {
        id: '1',
        title: '日本語&英語で話そう！カフェ交流会',
        description: '渋谷のおしゃれなカフェで、日本語と英語を使って楽しく交流しましょう！初心者の方も大歓迎です。お茶を飲みながらリラックスした雰囲気で異文化交流を楽しみましょう。',
        category: '言語交換',
        date: '2025-12-15',
        time: '14:00',
        location: '渋谷カフェ スターバックス 渋谷店',
        maxParticipants: 15,
        currentParticipants: 8,
        fee: 500,
        languages: ['日本語', '英語'],
        organizer: {
            id: 'u1',
            name: '山田 太郎',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        },
        tags: ['初心者歓迎', 'カフェ', '気軽'],
    },
    {
        id: '2',
        title: '韓国料理を作ろう！料理教室',
        description: '本場の韓国料理を一緒に作りましょう！キムチチゲとチヂミを作ります。料理しながら韓国の文化についても学べます。',
        category: '料理体験',
        date: '2025-12-20',
        time: '18:00',
        location: '新宿クッキングスタジオ',
        maxParticipants: 12,
        currentParticipants: 5,
        fee: 3000,
        languages: ['日本語', '韓国語'],
        organizer: {
            id: 'u2',
            name: 'キム ミンジ',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        },
        tags: ['料理', '韓国文化', '食事付き'],
    },
    {
        id: '3',
        title: '着物体験＆浅草散策',
        description: '日本の伝統文化、着物を体験してみませんか？着付けから写真撮影、浅草の観光まで楽しめます。外国の方大歓迎！',
        category: '文化体験',
        date: '2025-12-22',
        time: '10:00',
        location: '浅草 着物レンタル店',
        maxParticipants: 10,
        currentParticipants: 7,
        fee: 4000,
        languages: ['日本語', '英語', '中国語'],
        organizer: {
            id: 'u3',
            name: '佐藤 花子',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        },
        tags: ['着物', '観光', '写真撮影'],
    },
    {
        id: '4',
        title: 'サッカーで国際交流！',
        description: '国籍関係なく、サッカーを通じて友達を作りましょう！初心者から経験者まで大歓迎。試合後は懇親会もあります。',
        category: 'スポーツ',
        date: '2025-12-18',
        time: '16:00',
        location: '代々木公園 フットサルコート',
        maxParticipants: 20,
        currentParticipants: 15,
        fee: 1000,
        languages: ['日本語', '英語', 'スペイン語'],
        organizer: {
            id: 'u4',
            name: '田中 健太',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        },
        tags: ['スポーツ', '運動', 'チームワーク'],
    },
    {
        id: '5',
        title: '富士山日帰りツアー',
        description: '日本のシンボル、富士山を見に行きましょう！日帰りバスツアーで、富士五湖周辺を観光します。写真スポットもたくさん！',
        category: '観光',
        date: '2025-12-25',
        time: '07:00',
        location: '新宿駅西口 集合',
        maxParticipants: 30,
        currentParticipants: 22,
        fee: 8000,
        languages: ['日本語', '英語'],
        organizer: {
            id: 'u5',
            name: '鈴木 一郎',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        },
        tags: ['観光', '富士山', 'バスツアー'],
    },
    {
        id: '6',
        title: '中国茶会で文化交流',
        description: '本格的な中国茶を楽しみながら、中国の文化や歴史について語り合いましょう。お茶菓子も用意しています。',
        category: 'その他',
        date: '2025-12-28',
        time: '15:00',
        location: '銀座 中国茶カフェ',
        maxParticipants: 8,
        currentParticipants: 3,
        fee: 2000,
        languages: ['日本語', '中国語'],
        organizer: {
            id: 'u6',
            name: '王 麗',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        },
        tags: ['お茶', '文化', 'リラックス'],
    },
];

const categories: (EventCategory | '全て')[] = [
    '全て',
    '言語交換',
    '料理体験',
    '文化体験',
    'スポーツ',
    '観光',
    'その他',
];

export default function FindEventsPage() {
    const [events, setEvents] = useState<Event[]>(sampleEvents);
    const [selectedCategory, setSelectedCategory] = useState<EventCategory | '全て'>('全て');
    const [searchQuery, setSearchQuery] = useState('');

    const handleDelete = (id: string) => {
        if (!confirm('このイベントを削除しますか？')) return;
        setEvents((prev) => prev.filter((e) => e.id !== id));
    };

    const handleEdit = (id: string) => {
        alert(`イベント「${id}」の編集画面はまだ実装されていません（デモ）`);
    };

    const filteredEvents = events.filter((event) => {
        const matchesCategory =
            selectedCategory === '全て' || event.category === selectedCategory;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            event.title.toLowerCase().includes(q) ||
            event.description.toLowerCase().includes(q) ||
            event.tags?.some((tag) => tag.toLowerCase().includes(q));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="py-3 space-y-3">
            {/* ヘッダー */}
            <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                <h1 className="text-lg font-bold text-gray-800">イベント検索</h1>
            </div>

            {/* 検索バー */}
            <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="検索..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                    <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* カテゴリーフィルター */}
            <div className="overflow-x-auto mx-2">
                <div className="flex gap-1.5 pb-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === category
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-white text-gray-700 shadow-sm'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* イベント件数 */}
            <div className="mx-2">
                <p className="text-xs text-gray-600">
                    {filteredEvents.length}件
                </p>
            </div>

            {/* イベント一覧 */}
            <div className="space-y-2 mx-2 pb-4">
                {filteredEvents.map((event) => (
                    <div
                        key={event.id}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3"
                    >
                        <Link href={`/find/${event.id}`} className="block">
                            {/* タイトルとカテゴリー */}
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 flex-1">
                                    {event.title}
                                </h3>
                                <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium whitespace-nowrap">
                                    {event.category}
                                </span>
                            </div>

                            {/* 日時・場所 */}
                            <div className="space-y-1 text-xs text-gray-600 mb-2">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{event.date} {event.time}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    <span className="line-clamp-1">{event.location}</span>
                                </div>
                            </div>
                        </Link>

                        {/* 下部情報 + 操作ボタン */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                            <div className="flex items-center gap-2">
                                <img
                                    src={event.organizer.avatar}
                                    alt={event.organizer.name}
                                    className="w-5 h-5 rounded-full"
                                />
                                <span className="text-xs text-gray-600 truncate max-w-[100px]">
                                    {event.organizer.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                    {event.languages.slice(0, 2).map((lang) => (
                                        <span
                                            key={lang}
                                            className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs"
                                        >
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                                <span className="text-xs font-bold text-purple-600 mr-1">
                                    {event.fee ? `¥${event.fee.toLocaleString()}` : '無料'}
                                </span>
                                {/* 編集・削除ボタン（デモ用） */}
                                <button
                                    type="button"
                                    onClick={() => handleEdit(event.id)}
                                    className="px-2 py-1 text-[10px] border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                                >
                                    編集
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(event.id)}
                                    className="px-2 py-1 text-[10px] border border-red-300 text-red-500 rounded hover:bg-red-50"
                                >
                                    削除
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 検索結果なし */}
            {filteredEvents.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm mx-2">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-sm font-medium">イベントが見つかりません</p>
                </div>
            )}
        </div>
    );
}
