// イベント検索ページのサーバーコンポーネント

import { supabase } from '@/lib/supabaseClient';
import { Event } from '@/types/event';
import { transformSupabaseEventRows } from '@/lib/transformers/eventTransformer';
import FindEventsClient from './FindEventsClient';
import { logger } from '@/lib/utils/logger';

// サーバーコンポーネントとしてイベントデータを取得して、
// クライアントコンポーネントに渡す
export default async function FindEventsPage() {

    // Supabaseからイベントデータを取得
    const { data, error } = await supabase.from('events').select('*');

    // events 配列を初期化
    let events: Event[] = [];

    // エラーがなければ、トランスフォーマーを使用してデータを変換
    if (!error) {
        events = transformSupabaseEventRows(data || []);
        return <FindEventsClient initialEvents={events} />;
    }

    // エラーがあればログに出力し、空の配列を使用
    logger.error('Supabaseからのデータ取得エラー:', error);
    events = [];
    return <FindEventsClient initialEvents={events} />;

}
