// 絞り込み検索で選択しているフィルターを表示・管理するコンポーネント

'use client';

import { EventFilters } from '../_hooks/useEventFilters';

// コンポーネントのプロパティ型定義
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

// アクティブなフィルターを表示するコンポーネント
export default function ActiveFilters({
    filters,
    activeFilterCount,
    setFilters,
    clearFilter,
    clearAllFilters,
}: ActiveFiltersProps) {
    if (activeFilterCount === 0) return null;

    // 個別カテゴリ削除
    const removeCategory = (cat: string) => {
        const newCategories = filters.categories.filter(c => c !== cat);
        setFilters({ ...filters, categories: newCategories });
    };

    // 個別言語削除
    const removeLanguage = (lang: string) => {
        const newLangs = filters.languages.filter(l => l !== lang);
        setFilters({ ...filters, languages: newLangs });
    };

    return (
        <div className="mx-2 flex items-center gap-2 overflow-x-auto pb-2">

            {/* すべてクリアボタン */}
            <button
                onClick={clearAllFilters}
                className="flex-shrink-0 px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
            >
                クリア
            </button>

            {/* カテゴリーフィルター */}
            {filters.categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => removeCategory(cat)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-200"
                >
                    {cat}
                    <span className="text-gray-400">×</span>
                </button>
            ))}

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

            {/* 日付フィルター */}
            {filters.date && (
                <button
                    onClick={() => clearFilter('date')}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-200"
                >
                    {filters.date}
                    <span className="text-gray-400">×</span>
                </button>
            )}

            {/* 時間フィルター */}
            {filters.time && (
                <button
                    onClick={() => clearFilter('time')}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-200"
                >
                    {filters.time}
                    <span className="text-gray-400">×</span>
                </button>
            )}

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

            {/* 屋内/屋外フィルター */}
            {filters.inoutdoor && (
                <button
                    onClick={() => clearFilter('inoutdoor')}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-200"
                >
                    {filters.inoutdoor === 'in' ? 'Indoor' : 'Outdoor'}
                    <span className="text-gray-400">×</span>
                </button>
            )}

        </div>
    );
}
