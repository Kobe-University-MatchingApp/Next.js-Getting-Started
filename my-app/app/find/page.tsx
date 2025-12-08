'use client';

import { useState } from 'react';
import { EventCategory } from '@/types/event'; // Eventのインポートは不要になります
import Link from 'next/link';
import { sampleEvents } from '@/data/events'; // ★ここを変更：外部ファイルから読み込み
// サンプルデータ


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
    const [selectedCategory, setSelectedCategory] = useState<EventCategory | '全て'>('全て');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEvents = sampleEvents.filter((event) => {
        const matchesCategory =
            selectedCategory === '全て' || event.category === selectedCategory;
        const matchesSearch =
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
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
                    <Link key={event.id} href={`/find/${event.id}`}>
                        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3">
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

                            {/* 下部情報 */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <img src={event.organizer.avatar} alt={event.organizer.name} className="w-5 h-5 rounded-full" />
                                    <span className="text-xs text-gray-600 truncate max-w-[100px]">{event.organizer.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {event.languages.slice(0, 2).map((lang) => (
                                            <span key={lang} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-purple-600">
                                        {event.fee ? `¥${event.fee.toLocaleString()}` : '無料'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
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
