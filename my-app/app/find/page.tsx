import { supabase } from '@/lib/supabaseClient';
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
        events = rows.map((row: any) => {
            // languagesとtagsがJSON文字列の場合はパースする
            let parsedLanguages: string[] = [];
            if (typeof row.languages === 'string') {
                try {
                    parsedLanguages = JSON.parse(row.languages);
                } catch (e) {
                    console.error('languages パースエラー:', e);
                    parsedLanguages = [];
                }
            } else if (Array.isArray(row.languages)) {
                parsedLanguages = row.languages;
            }

            let parsedTags: string[] | undefined = undefined;
            if (typeof row.tags === 'string') {
                try {
                    parsedTags = JSON.parse(row.tags);
                } catch (e) {
                    console.error('tags パースエラー:', e);
                    parsedTags = undefined;
                }
            } else if (Array.isArray(row.tags)) {
                parsedTags = row.tags;
            }

            let parsedImages: string[] | undefined = undefined;
            if (typeof row.images === 'string') {
                try {
                    parsedImages = JSON.parse(row.images);
                    if (parsedImages && parsedImages.length === 0) {
                        parsedImages = undefined;
                    }
                } catch (e) {
                    console.error('images パースエラー:', e);
                    parsedImages = undefined;
                }
            } else if (Array.isArray(row.images)) {
                parsedImages = row.images;
            }

            return {
                id: String(row.id ?? ''),
                title: String(row.title ?? ''),
                description: String(row.description ?? ''),
                category: (row.category ?? 'その他') as Event['category'],
                date: String(row.date ?? ''),
                // Supabaseのフィールドは全て小文字
                dayOfWeek: String(row.dayofweek ?? row.day_of_week ?? row.dayOfWeek ?? 'mon'),
                period: Number(row.period ?? 1),
                location: String(row.location ?? ''),
                maxParticipants: Number(row.maxparticipants ?? row.max_participants ?? row.maxParticipants ?? 0),
                currentParticipants: Number(row.currentparticipants ?? row.current_participants ?? row.currentParticipants ?? 0),
                fee: typeof row.fee === 'number' ? row.fee : undefined,
                languages: parsedLanguages,
                organizer: {
                    id: String(row.organizer_id ?? 'unknown'),
                    name: String(row.organizer_name ?? '未設定'),
                    avatar: String(row.organizer_avatar ?? ''),
                },
                images: parsedImages,
                tags: parsedTags,
            }
        });
    }

    return <FindEventsClient initialEvents={events} />;
}
