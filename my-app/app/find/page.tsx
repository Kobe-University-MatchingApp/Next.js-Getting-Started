import { supabase } from '@/lib/supabase';
import { Event } from '@/types/event';
import FindEventsClient from './FindEventsClient';

export default async function FindEventsPage() {
    const { data, error } = await supabase.from('events').select('*');

    let events: Event[] = [];

    if (error) {
        console.error('Supabaseからのデータ取得エラー:', error);
        // エラー時は空の配列を返す
        events = [];
    } else {
        const rows = Array.isArray(data) ? data : [];
        events = rows.map((row: any) => ({
            id: String(row.id ?? ''),
            title: String(row.title ?? ''),
            description: String(row.description ?? ''),
            category: (row.category ?? 'その他') as Event['category'],
            date: String(row.date ?? ''),
            dayOfWeek: String(row.dayOfWeek ?? 'mon'),
            period: Number(row.period ?? 1),
            location: String(row.location ?? ''),
            maxParticipants: Number(row.maxParticipants ?? 0),
            currentParticipants: Number(row.currentParticipants ?? 0),
            fee: typeof row.fee === 'number' ? row.fee : undefined,
            languages: Array.isArray(row.languages) ? row.languages : [],
            organizer: {
                id: String(row.organizer_id ?? 'unknown'),
                name: String(row.organizer_name ?? '未設定'),
                avatar: String(row.organizer_avatar ?? ''),
            },
            images: Array.isArray(row.images) ? row.images : undefined,
            tags: Array.isArray(row.tags) ? row.tags : undefined,
        }));
    }

    return <FindEventsClient initialEvents={events} />;
}
