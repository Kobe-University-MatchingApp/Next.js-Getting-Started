'use client';

import { useState } from 'react';
import { Event, EventCategory } from '@/types/event';
import Link from 'next/link';

interface FindEventsClientProps {
    initialEvents: Event[];
}

export default function FindEventsClient({ initialEvents }: FindEventsClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        location: '',
        timeSlots: [] as string[], // 'mon-1', 'tue-2'などの形式
        minParticipants: null as number | null,
        maxParticipants: null as number | null,
        languages: [] as string[],
        tags: [] as string[],
        maxFee: null as number | null,
    });

    // 利用可能な選択肢
    const availableLocations = ['食堂', 'スターバックス', 'ラーニングコモンズ', '学生会館', '教室'];
    const availableLanguages = ['日本語', '英語', '中国語', '韓国語', 'スペイン語'];
    const availableTags = ['カフェ', '料理', '音楽', '映画', '読書', '写真', 'スポーツ', 'アウトドア', '旅行', 'アート', 'ファッション'];

    // 時間割の定義
    const daysOfWeek = [
        { id: 'mon', label: '月' },
        { id: 'tue', label: '火' },
        { id: 'wed', label: '水' },
        { id: 'thu', label: '木' },
        { id: 'fri', label: '金' },
    ];

    const periods = [
        { id: 1, label: '1限', time: '09:00-10:30' },
        { id: 2, label: '2限', time: '10:40-12:10' },
        { id: 3, label: '3限', time: '13:10-14:40' },
        { id: 4, label: '4限', time: '14:50-16:20' },
        { id: 5, label: '5限', time: '16:30-18:00' },
    ];

    // 時限選択のトグル
    const toggleTimeSlot = (dayId: string, periodId: number) => {
        const slotId = `${dayId}-${periodId}`;
        const newSlots = filters.timeSlots.includes(slotId)
            ? filters.timeSlots.filter(s => s !== slotId)
            : [...filters.timeSlots, slotId];
        setFilters({ ...filters, timeSlots: newSlots });
    };

    // アクティブなフィルター数を計算
    const activeFilterCount = [
        filters.location,
        filters.timeSlots.length > 0,
        filters.minParticipants,
        filters.maxParticipants,
        filters.languages.length > 0,
        filters.tags.length > 0,
        filters.maxFee !== null,
    ].filter(Boolean).length;

    // フィルターをクリア
    const clearFilter = (key: string) => {
        setFilters({ ...filters, [key]: key === 'languages' || key === 'tags' || key === 'timeSlots' ? [] : key === 'minParticipants' || key === 'maxParticipants' || key === 'maxFee' ? null : '' });
    };

    const clearAllFilters = () => {
        setFilters({
            location: '',
            timeSlots: [],
            minParticipants: null,
            maxParticipants: null,
            languages: [],
            tags: [],
            maxFee: null,
        });
    };

    // 予算のラベル
    const getFeeLabel = (fee: number) => {
        if (fee === 0) return '無料';
        return `¥${fee.toLocaleString()}以下`;
    };

    const filteredEvents = initialEvents.filter((event) => {
        const matchesSearch =
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesLocation = !filters.location || event.location.includes(filters.location);

        // 時限フィルタ: 選択された時限とイベントの時限が一致するかチェック
        const eventSlot = `${event.dayOfWeek}-${event.period}`;
        const matchesTimeSlots = filters.timeSlots.length === 0 || filters.timeSlots.includes(eventSlot);

        const matchesMinParticipants = !filters.minParticipants || event.maxParticipants >= filters.minParticipants;
        const matchesMaxParticipants = !filters.maxParticipants || event.maxParticipants <= filters.maxParticipants;
        const matchesLanguages = filters.languages.length === 0 ||
            filters.languages.some(lang => event.languages.includes(lang));
        const matchesTags = filters.tags.length === 0 ||
            filters.tags.some(tag => event.tags?.includes(tag));
        const matchesFee = filters.maxFee === null || (event.fee || 0) <= filters.maxFee;

        return matchesSearch && matchesLocation && matchesTimeSlots &&
            matchesMinParticipants && matchesMaxParticipants && matchesLanguages &&
            matchesTags && matchesFee;
    });

    return (
        <div className="py-3 space-y-3 bg-gray-50 min-h-screen">
            {/* ヘッダー */}
            <div className="bg-white border-b border-gray-200 p-4 mx-0">
                <h1 className="text-xl font-bold text-gray-900">イベント検索</h1>
            </div>

            {/* 検索バー */}
            <div className="bg-white border-b border-gray-200 p-3 mx-0">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="イベントを検索"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none text-sm"
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

            {/* 選択中のフィルターと絞り込みボタン */}
            <div className="mx-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {/* 絞り込みボタン */}
                    <button
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        絞り込み
                        {activeFilterCount > 0 && (
                            <span className="bg-white text-blue-600 px-1.5 py-0.5 rounded-md text-xs font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {/* すべてクリアボタン */}
                    {activeFilterCount > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="flex-shrink-0 px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                        >
                            クリア
                        </button>
                    )}

                    {/* 場所フィルター */}
                    {filters.location && (
                        <button
                            onClick={() => clearFilter('location')}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-200"
                        >
                            {filters.location}
                            <span className="text-gray-400">×</span>
                        </button>
                    )}

                    {/* 開始時間フィルター */}
                    {filters.timeSlots.length > 0 && filters.timeSlots.map(slot => {
                        const [dayId, periodId] = slot.split('-');
                        const day = daysOfWeek.find(d => d.id === dayId);
                        const period = periods.find(p => p.id === Number(periodId));
                        return (
                            <button
                                key={slot}
                                onClick={() => toggleTimeSlot(dayId, Number(periodId))}
                                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-200"
                            >
                                {day?.label}{period?.label}
                                <span className="text-gray-400">×</span>
                            </button>
                        );
                    })}

                    {/* 最小人数フィルター */}
                    {filters.minParticipants && (
                        <button
                            onClick={() => clearFilter('minParticipants')}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-200"
                        >
                            {filters.minParticipants}人以上
                            <span className="text-gray-400">×</span>
                        </button>
                    )}

                    {/* 最大人数フィルター */}
                    {filters.maxParticipants && (
                        <button
                            onClick={() => clearFilter('maxParticipants')}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-200"
                        >
                            {filters.maxParticipants}人以下
                            <span className="text-gray-400">×</span>
                        </button>
                    )}

                    {/* 言語フィルター */}
                    {filters.languages.map(lang => (
                        <button
                            key={lang}
                            onClick={() => {
                                const newLangs = filters.languages.filter(l => l !== lang);
                                setFilters({ ...filters, languages: newLangs });
                            }}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-200"
                        >
                            {lang}
                            <span className="text-gray-400">×</span>
                        </button>
                    ))}

                    {/* タグフィルター */}
                    {filters.tags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => {
                                const newTags = filters.tags.filter(t => t !== tag);
                                setFilters({ ...filters, tags: newTags });
                            }}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-200"
                        >
                            {tag}
                            <span className="text-gray-400">×</span>
                        </button>
                    ))}

                    {/* 予算フィルター */}
                    {filters.maxFee !== null && (
                        <button
                            onClick={() => clearFilter('maxFee')}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-200"
                        >
                            {getFeeLabel(filters.maxFee)}
                            <span className="text-gray-400">×</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 絞り込みモーダル */}
            {isFilterModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                    <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-y-auto">
                        {/* モーダルヘッダー */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">絞り込み</h2>
                            <button
                                onClick={() => setIsFilterModalOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* フィルターコンテンツ */}
                        <div className="p-4 space-y-4">
                            {/* 場所 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">場所</label>
                                <select
                                    value={filters.location}
                                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                >
                                    <option value="">すべて</option>
                                    {availableLocations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 開講時限 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">開講時限</label>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-600"></th>
                                                {daysOfWeek.map(day => (
                                                    <th key={day.id} className="border border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-700">
                                                        {day.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {periods.map(period => (
                                                <tr key={period.id}>
                                                    <td className="border border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-600 whitespace-nowrap">
                                                        {period.label}
                                                        <div className="text-[10px] text-gray-500">{period.time}</div>
                                                    </td>
                                                    {daysOfWeek.map(day => {
                                                        const slotId = `${day.id}-${period.id}`;
                                                        const isSelected = filters.timeSlots.includes(slotId);
                                                        return (
                                                            <td key={day.id} className="border border-gray-300 p-0">
                                                                <button
                                                                    onClick={() => toggleTimeSlot(day.id, period.id)}
                                                                    className={`w-full h-12 transition-colors ${isSelected
                                                                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                                                        : 'bg-white hover:bg-gray-50 text-gray-700'
                                                                        }`}
                                                                >
                                                                    {isSelected && (
                                                                        <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 時間の長さ */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">時間の長さ</label>
                                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700">
                                    1コマ(90分)
                                </div>
                                <p className="text-xs text-gray-500 mt-1">すべてのイベントは1コマ分です</p>
                            </div>

                            {/* 人数 */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">最小人数</label>
                                    <input
                                        type="number"
                                        value={filters.minParticipants || ''}
                                        onChange={(e) => setFilters({ ...filters, minParticipants: e.target.value ? Number(e.target.value) : null })}
                                        placeholder="指定なし"
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">最大人数</label>
                                    <input
                                        type="number"
                                        value={filters.maxParticipants || ''}
                                        onChange={(e) => setFilters({ ...filters, maxParticipants: e.target.value ? Number(e.target.value) : null })}
                                        placeholder="指定なし"
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* 言語 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">会話言語</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableLanguages.map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => {
                                                const newLangs = filters.languages.includes(lang)
                                                    ? filters.languages.filter(l => l !== lang)
                                                    : [...filters.languages, lang];
                                                setFilters({ ...filters, languages: newLangs });
                                            }}
                                            className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${filters.languages.includes(lang)
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 趣味タグ */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">趣味タグ</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => {
                                                const newTags = filters.tags.includes(tag)
                                                    ? filters.tags.filter(t => t !== tag)
                                                    : [...filters.tags, tag];
                                                setFilters({ ...filters, tags: newTags });
                                            }}
                                            className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${filters.tags.includes(tag)
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 予算 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">予算(最大)</label>
                                <select
                                    value={filters.maxFee || ''}
                                    onChange={(e) => setFilters({ ...filters, maxFee: e.target.value ? Number(e.target.value) : null })}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                >
                                    <option value="">指定なし</option>
                                    <option value="0">無料</option>
                                    <option value="1000">¥1,000以下</option>
                                    <option value="3000">¥3,000以下</option>
                                    <option value="5000">¥5,000以下</option>
                                    <option value="10000">¥10,000以下</option>
                                </select>
                            </div>
                        </div>

                        {/* モーダルフッター */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
                            <button
                                onClick={clearAllFilters}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                クリア
                            </button>
                            <button
                                onClick={() => setIsFilterModalOpen(false)}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                適用
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* イベント件数 */}
            <div className="mx-2">
                <p className="text-xs text-gray-600">
                    {filteredEvents.length}件
                </p>
            </div>

            {/* イベント一覧 */}
            <div className="space-y-0 mx-0 pb-20">
                {filteredEvents.map((event) => (
                    <Link key={event.id} href={`/find/${event.id}`}>
                        <div className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors p-4">
                            {/* タイトルとカテゴリー */}
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1">
                                    {event.title}
                                </h3>
                                <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium whitespace-nowrap">
                                    {event.category}
                                </span>
                            </div>

                            {/* 日時・場所 */}
                            <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700">📅</span>
                                    <span>
                                        {event.date} · {daysOfWeek.find(d => d.id === event.dayOfWeek)?.label}曜{periods.find(p => p.id === event.period)?.label} ({periods.find(p => p.id === event.period)?.time})
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700">📍</span>
                                    <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700">👥</span>
                                    <span>{event.currentParticipants}/{event.maxParticipants}人</span>
                                </div>
                            </div>

                            {/* 下部情報 */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <img src={event.organizer.avatar} alt={event.organizer.name} className="w-6 h-6 rounded-full" />
                                    <span className="text-sm text-gray-600">{event.organizer.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {event.languages.slice(0, 2).map((lang) => (
                                        <span key={lang} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                            {lang}
                                        </span>
                                    ))}
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
