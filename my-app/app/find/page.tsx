import { supabase } from '@/lib/supabaseClient';
import { Event } from '@/types/event';
import { transformSupabaseEventRows } from '@/lib/transformers/eventTransformer';
import FindEventsClient from './FindEventsClient';

export default async function FindEventsPage() {
    const { data, error } = await supabase.from('events').select('*');

    let events: Event[] = [];

    if (error) {
        console.error('Supabaseからのデータ取得エラー:', error);
        // エラー時は空の配列を返す
        events = [];
    } else {
        // トランスフォーマーを使用してデータを変換
        events = transformSupabaseEventRows(data || []);
    }

    return <FindEventsClient initialEvents={events} />;
}
