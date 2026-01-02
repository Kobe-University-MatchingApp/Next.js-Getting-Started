// イベントを絞り込み検索＝フィルターするためのカスタムフック

import { useState, useMemo } from 'react';
import { Event } from '@/types/event';

// フィルターの状態を定義
export interface EventFilters {
    location: string;
    timeSlots: string[];
    minParticipants: number | null;
    maxParticipants: number | null;
    languages: string[];
    tags: string[];
    maxFee: number | null;
}

// フィルターの初期状態
const initialFilters: EventFilters = {
    location: '',
    timeSlots: [],
    minParticipants: null,
    maxParticipants: null,
    languages: [],
    tags: [],
    maxFee: null,
};

// カスタムフックの定義
export function useEventFilters(events: Event[], searchQuery: string) {
    const [filters, setFilters] = useState<EventFilters>(initialFilters);

    // アクティブなフィルター数を計算
    // (useMemoだと、filtersの変更時にのみ再計算されるので効率的)
    const activeFilterCount = useMemo(() => {
        return [
            filters.location,
            filters.timeSlots.length > 0,
            filters.minParticipants,
            filters.maxParticipants,
            filters.languages.length > 0,
            filters.tags.length > 0,
            filters.maxFee !== null,
        ].filter(Boolean).length;
    }, [filters]);

    // フィルターをクリア
    const clearFilter = (key: keyof EventFilters) => {
        const defaultValues: Record<keyof EventFilters, any> = {
            location: '',
            timeSlots: [],
            minParticipants: null,
            maxParticipants: null,
            languages: [],
            tags: [],
            maxFee: null,
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

            const matchesLocation = !filters.location || event.location.includes(filters.location);

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
