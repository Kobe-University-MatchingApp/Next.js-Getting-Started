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
    if (!error && data) {
        events = transformSupabaseEventRows(data);
        
        // organizer_avatar が null の場合、profiles テーブルから画像を取得
        events = await Promise.all(
            events.map(async (event) => {
                // organizer_avatar が既に設定されている場合はスキップ
                if (event.organizer.avatar && event.organizer.avatar.trim()) {
                    return event;
                }

                // organizer_id がゲストの場合（guest_で始まる）はスキップ
                if (event.organizer.id.startsWith('guest_')) {
                    return event;
                }

                try {
                    // profiles テーブルから画像を取得
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('images')
                        .eq('id', event.organizer.id)
                        .single();

                    if (profile?.images && Array.isArray(profile.images) && profile.images.length > 0) {
                        return {
                            ...event,
                            organizer: {
                                ...event.organizer,
                                avatar: profile.images[0],
                            },
                        };
                    }
                } catch (err) {
                    logger.error(`Failed to fetch profile image for organizer ${event.organizer.id}:`, err);
                }

                return event;
            })
        );

        return <FindEventsClient initialEvents={events} />;
    }

    // エラーがあればログに出力し、空の配列を使用
    logger.error('Supabaseからのデータ取得エラー:', error);
    events = [];
    return <FindEventsClient initialEvents={events} />;

}
