// イベントを絞り込み検索＝フィルターするためのカスタムフック

import { useState, useMemo } from 'react';
import { Event } from '@/types/event';
import { isEventCompleted } from '@/lib/utils/eventStatus';

// フィルターの状態を定義
export interface EventFilters {
    categories: string[];
    location: string;
    date: string;
    time: string;
    minParticipants: number | null;
    maxParticipants: number | null;
    languages: string[];
    maxFee: number | null;
    inoutdoor: string;
    excludeCompleted: boolean;
}

// フィルターの初期状態
const initialFilters: EventFilters = {
    categories: [],
    location: '',
    date: '',
    time: '',
    minParticipants: null,
    maxParticipants: null,
    languages: [],
    maxFee: null,
    inoutdoor: '',
    excludeCompleted: false,
};

// カスタムフックの定義
export function useEventFilters(events: Event[], searchQuery: string) {
    const [filters, setFilters] = useState<EventFilters>(initialFilters);

    // アクティブなフィルター数を計算
    // (useMemoだと、filtersの変更時にのみ再計算されるので効率的)
    const activeFilterCount = useMemo(() => {
        return [
            filters.categories.length > 0,
            filters.location,
            filters.date,
            filters.time,
            filters.minParticipants,
            filters.maxParticipants,
            filters.languages.length > 0,
            filters.maxFee !== null,
            filters.inoutdoor,
            filters.excludeCompleted,
        ].filter(Boolean).length;
    }, [filters]);

    // フィルターをクリア
    const clearFilter = (key: keyof EventFilters) => {
        const defaultValues: Record<keyof EventFilters, any> = {
            categories: [],
            location: '',
            date: '',
            time: '',
            minParticipants: null,
            maxParticipants: null,
            languages: [],
            maxFee: null,
            inoutdoor: '',
            excludeCompleted: false,
        };

        setFilters({ ...filters, [key]: defaultValues[key] });
    };

    const clearAllFilters = () => {
        setFilters(initialFilters);
    };

    // フィルター処理
    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesSearch =
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = filters.categories.length === 0 || filters.categories.includes(event.category);

            const matchesLocation = !filters.location || event.location.includes(filters.location);

            // 日付フィルター（event.dateは "YYYY-MM-DD HH:MM" 形式）
            const matchesDate = !filters.date || event.date.startsWith(filters.date);

            // 時刻フィルター（event.dateから時刻部分を抽出）
            const matchesTime = !filters.time || (() => {
                const eventTime = event.date.split(' ')[1];
                return eventTime && eventTime.startsWith(filters.time);
            })();

            const matchesMinParticipants = !filters.minParticipants || event.maxParticipants >= filters.minParticipants;
            const matchesMaxParticipants = !filters.maxParticipants || event.maxParticipants <= filters.maxParticipants;
            const matchesLanguages = filters.languages.length === 0 ||
                filters.languages.some(lang => event.languages.includes(lang));
            const matchesFee = filters.maxFee === null || (event.fee || 0) <= filters.maxFee;

            const matchesInOutDoor = !filters.inoutdoor || event.inoutdoor === filters.inoutdoor;

            const matchesCompleted = !filters.excludeCompleted || !isEventCompleted(event.date);

            return matchesSearch && matchesCategory && matchesLocation && matchesDate &&
                matchesTime && matchesMinParticipants && matchesMaxParticipants && matchesLanguages &&
                matchesFee && matchesInOutDoor && matchesCompleted;
        });
    }, [events, searchQuery, filters]);

    return {
        filters,
        setFilters,
        clearFilter,
        clearAllFilters,
        activeFilterCount,
        filteredEvents,
    };
}
