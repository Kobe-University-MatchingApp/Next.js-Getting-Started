// 絞り込み検索モーダルのコンポーネント

'use client';

import { EventFilters } from './_hooks/useEventFilters';
import { EVENT_CATEGORIES, AVAILABLE_LANGUAGES, AVAILABLE_LOCATIONS } from '@/lib/constants';
import { EventCategory } from '@/types/event';

// コンポーネントのプロパティ型定義
interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: EventFilters;
    setFilters: (filters: EventFilters) => void;
    clearAllFilters: () => void;
    resultCount: number;
}

export default function FilterModal({
    isOpen,
    onClose,
    filters,
    setFilters,
    clearAllFilters,
    resultCount,
}: FilterModalProps) {

    // モーダルが閉じている場合は何もレンダリングしない
    if (!isOpen) return null;

    // モーダルのレンダリング
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end mb-0">
            <div className="bg-white w-full rounded-t-2xl max-h-[95vh] overflow-y-auto mb-0">
                {/* モーダルヘッダー */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">項目で絞り込み</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* フィルターコンテンツ */}
                <div className="p-4 space-y-4">
                    {/* カテゴリー */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">カテゴリー</label>
                        <div className="grid grid-cols-3 gap-2">
                            {EVENT_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                        const newCategories = filters.categories.includes(cat)
                                            ? filters.categories.filter(c => c !== cat)
                                            : [...filters.categories, cat];
                                        setFilters({ ...filters, categories: newCategories });
                                    }}
                                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${filters.categories.includes(cat)
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 開催日時 */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">開催日</label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">開催時間</label>
                        <input
                            type="time"
                            value={filters.time}
                            onChange={(e) => setFilters({ ...filters, time: e.target.value })}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* 場所 */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">場所</label>
                        <select
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        >
                            <option value="">すべて</option>
                            {AVAILABLE_LOCATIONS.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    {/* 屋内・屋外 */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">屋内 / 屋外</label>
                        <select
                            value={filters.inoutdoor}
                            onChange={(e) => setFilters({ ...filters, inoutdoor: e.target.value })}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        >
                            <option value="">すべて</option>
                            <option value="in">Indoor</option>
                            <option value="out">Outdoor</option>
                        </select>
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

                    {/* 参加費 */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">参加費(最大)</label>
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

                    {/* 対応言語 */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">対応言語</label>
                        <div className="flex flex-wrap gap-1.5">
                            {AVAILABLE_LANGUAGES.map(lang => (
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
                </div>

                {/* モーダルフッター */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 flex gap-3 h-16 items-center px-4">
                    <button
                        onClick={clearAllFilters}
                        className="flex-1 h-10 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        クリア
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 h-10 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        {resultCount}件を表示
                    </button>
                </div>
            </div>
        </div>
    );
}
