// イベント検索画面のコンポーネント

'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/types/event';
import EventCard from '@/app/_components/EventCard';
import FilterModal from './FilterModal';
import ActiveFilters from './_components/ActiveFilters';
import { useModal } from '@/app/_contexts/ModalContext';
import { useEventFilters } from './_hooks/useEventFilters';
import { useScrollVisibility } from '@/lib/hooks/useScrollVisibility';

// コンポーネントのプロパティ型定義
interface FindEventsClientProps {
    initialEvents: Event[];
}

// イベント検索コンポーネント
export default function FindEventsClient({ initialEvents }: FindEventsClientProps) {

    // 状態管理（検索クエリ、フィルターモーダルの開閉状態）
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const { setIsModalOpen } = useModal();

    // カスタムフックを使用
    const {
        filters,
        setFilters,
        clearFilter,
        clearAllFilters,
        activeFilterCount,
        filteredEvents,
    } = useEventFilters(initialEvents, searchQuery);

    // スクロールに応じてフローティングボタンの表示制御
    const showFloatingButton = useScrollVisibility();

    // モーダル開閉時にグローバル状態を更新
    useEffect(() => {
        setIsModalOpen(isFilterModalOpen);
    }, [isFilterModalOpen, setIsModalOpen]);

    return (
        <div className="py-3 space-y-3 min-h-screen">
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

            {/* 選択中のフィルター */}
            <ActiveFilters
                filters={filters}
                activeFilterCount={activeFilterCount}
                setFilters={setFilters}
                clearFilter={clearFilter}
                clearAllFilters={clearAllFilters}
            />

            {/* フローティング絞り込みボタン */}
            <button
                onClick={() => setIsFilterModalOpen(true)}
                className={`fixed bottom-20 right-4 z-40 flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-full shadow-lg text-sm font-medium hover:bg-blue-700 transition-all duration-300 ${showFloatingButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'
                    }`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                絞り込み
            </button>

            {/* 絞り込みモーダル */}
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                filters={filters}
                setFilters={setFilters}
                clearAllFilters={clearAllFilters}
                resultCount={filteredEvents.length}
            />

            {/* イベント件数 */}
            {(filteredEvents.length !== initialEvents.length || activeFilterCount > 0) && (
                <div className="mx-2 mb-2">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                            {filteredEvents.length}件のイベント
                        </p>
                    </div>
                </div>
            )}

            {/* イベント一覧 */}
            <div className="space-y-0 mx-0 pb-20">
                {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
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
