'use client';

import { EventFilters } from './_hooks/useEventFilters';
import { DAYS_OF_WEEK, PERIODS, AVAILABLE_LANGUAGES, AVAILABLE_LOCATIONS, AVAILABLE_TAGS } from '@/lib/constants';

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

    // 時限の選択・解除をトグルする関数
    const toggleTimeSlot = (dayId: string, periodId: number) => {
        // スロットIDを生成（例: "mon-1" = 月曜1限）
        const slotId = `${dayId}-${periodId}`;

        // 既に選択されていれば削除、未選択なら追加
        // （三項演算子: 条件 ? 真の場合 : 偽の場合 ※if文の簡略版）
        const newSlots = filters.timeSlots.includes(slotId)
            ? filters.timeSlots.filter(s => s !== slotId)
            : [...filters.timeSlots, slotId];

        setFilters({ ...filters, timeSlots: newSlots });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end mb-0">
            <div className="bg-white w-full rounded-t-2xl max-h-[95vh] overflow-y-auto mb-0">
                {/* モーダルヘッダー */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">絞り込み</h2>
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

                    {/* 開講時限 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">開講時限</label>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-600"></th>
                                        {DAYS_OF_WEEK.map(day => (
                                            <th key={day.id} className="border border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-700">
                                                {day.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {PERIODS.map(period => (
                                        <tr key={period.id}>
                                            <td className="border border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-600 whitespace-nowrap">
                                                {period.label}
                                                <div className="text-[10px] text-gray-500">{period.time}</div>
                                            </td>
                                            {DAYS_OF_WEEK.map(day => {
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

                    {/* 趣味タグ */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">趣味タグ</label>
                        <div className="flex flex-wrap gap-1.5">
                            {AVAILABLE_TAGS.map(tag => (
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
