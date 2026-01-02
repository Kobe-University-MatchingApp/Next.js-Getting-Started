'use client';

import { EventFilters } from '../hooks/useEventFilters';
import { DAYS_OF_WEEK, PERIODS } from '@/lib/constants';

interface ActiveFiltersProps {
    filters: EventFilters;
    activeFilterCount: number;
    setFilters: (filters: EventFilters) => void;
    clearFilter: (key: keyof EventFilters) => void;
    clearAllFilters: () => void;
}

// 予算のラベル
const getFeeLabel = (fee: number) => {
    if (fee === 0) return '無料';
    return `¥${fee.toLocaleString()}以下`;
};

export default function ActiveFilters({
    filters,
    activeFilterCount,
    setFilters,
    clearFilter,
    clearAllFilters,
}: ActiveFiltersProps) {
    if (activeFilterCount === 0) return null;

    // 時限トグル用のヘルパー
    const toggleTimeSlot = (dayId: string, periodId: number) => {
        const slotId = `${dayId}-${periodId}`;
        const newSlots = filters.timeSlots.includes(slotId)
            ? filters.timeSlots.filter(s => s !== slotId)
            : [...filters.timeSlots, slotId];
        setFilters({ ...filters, timeSlots: newSlots });
    };

    // 個別言語削除
    const removeLanguage = (lang: string) => {
        const newLangs = filters.languages.filter(l => l !== lang);
        setFilters({ ...filters, languages: newLangs });
    };

    // 個別タグ削除
    const removeTag = (tag: string) => {
        const newTags = filters.tags.filter(t => t !== tag);
        setFilters({ ...filters, tags: newTags });
    };

    return (
        <div className="mx-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {/* すべてクリアボタン */}
                <button
                    onClick={clearAllFilters}
                    className="flex-shrink-0 px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                    クリア
                </button>

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
                    const day = DAYS_OF_WEEK.find(d => d.id === dayId);
                    const period = PERIODS.find(p => p.id === Number(periodId));
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
                        onClick={() => removeLanguage(lang)}
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
                        onClick={() => removeTag(tag)}
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
    );
}
