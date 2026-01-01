'use client';

import { useState, useEffect } from 'react';
import { Event, EventCategory } from '@/types/event';
import EventCard from '@/app/components/EventCard';
import FilterModal from './FilterModal';
import { useModal } from '@/app/contexts/ModalContext';

interface FindEventsClientProps {
    initialEvents: Event[];
}

export default function FindEventsClient({ initialEvents }: FindEventsClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const { setIsModalOpen } = useModal();
    const [showFloatingButton, setShowFloatingButton] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [filters, setFilters] = useState({
        location: '',
        timeSlots: [] as string[], // 'mon-1', 'tue-2'などの形式
        minParticipants: null as number | null,
        maxParticipants: null as number | null,
        languages: [] as string[],
        tags: [] as string[],
        maxFee: null as number | null,
    });

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

    // モーダル開閉時にグローバル状態を更新
    useEffect(() => {
        setIsModalOpen(isFilterModalOpen);
    }, [isFilterModalOpen, setIsModalOpen]);

    // スクロール方向を検知してフローティングボタンの表示を制御
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 10) {
                // 最上部付近では常に表示
                setShowFloatingButton(true);
            } else if (currentScrollY > lastScrollY) {
                // 下スクロール時は非表示
                setShowFloatingButton(false);
            } else {
                // 上スクロール時は表示
                setShowFloatingButton(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

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

            {/* 選択中のフィルター */}
            {activeFilterCount > 0 && (
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
            )}

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
