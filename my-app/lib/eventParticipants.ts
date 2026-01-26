// イベント参加管理のロジック

import { createClient } from '@/utils/supabase/client';
import { EventParticipant, UserRegisteredEvent, ParticipantStatus } from '@/types/event';

/**
 * イベントに参加登録する
 */
export async function registerForEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    try {
        // 認証チェック
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'ログインが必要です' };
        }

        // 既に登録済みかチェック
        const { data: existing } = await supabase
            .from('event_participants')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .single();

        if (existing) {
            return { success: false, error: '既に参加登録済みです' };
        }

        // イベント情報を取得して定員チェック
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('maxparticipants, currentparticipants')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            return { success: false, error: 'イベントが見つかりません' };
        }

        // 定員チェック
        const isFull = event.currentparticipants >= event.maxparticipants;
        const status: ParticipantStatus = isFull ? 'waitlist' : 'registered';

        // 参加登録
        const { error: insertError } = await supabase
            .from('event_participants')
            .insert({
                event_id: eventId,
                user_id: user.id,
                status: status,
            });

        if (insertError) {
            console.error('参加登録エラー:', insertError);
            return { success: false, error: '参加登録に失敗しました' };
        }

        return { success: true };
    } catch (error) {
        console.error('参加登録エラー:', error);
        return { success: false, error: '予期しないエラーが発生しました' };
    }
}

/**
 * イベント参加をキャンセルする
 */
export async function cancelEventRegistration(eventId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'ログインが必要です' };
        }

        // キャンセル処理（ステータスを更新）
        const { error: updateError } = await supabase
            .from('event_participants')
            .update({
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
            })
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .eq('status', 'registered'); // 登録済みのもののみキャンセル可能

        if (updateError) {
            console.error('キャンセルエラー:', updateError);
            return { success: false, error: 'キャンセルに失敗しました' };
        }

        return { success: true };
    } catch (error) {
        console.error('キャンセルエラー:', error);
        return { success: false, error: '予期しないエラーが発生しました' };
    }
}

/**
 * ユーザーの特定イベントへの参加状態を取得
 */
export async function getUserEventStatus(eventId: string): Promise<EventParticipant | null> {
    const supabase = createClient();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return null;
        }

        const { data, error } = await supabase
            .from('event_participants')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .single();

        if (error || !data) {
            return null;
        }

        return {
            id: data.id,
            eventId: data.event_id,
            userId: data.user_id,
            status: data.status,
            registeredAt: data.registered_at,
            cancelledAt: data.cancelled_at,
            notes: data.notes,
        };
    } catch (error) {
        console.error('参加状態取得エラー:', error);
        return null;
    }
}

/**
 * ユーザーの参加予定イベント一覧を取得
 */
export async function getUserRegisteredEvents(): Promise<UserRegisteredEvent[]> {
    const supabase = createClient();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return [];
        }

        // 参加登録とイベント情報を結合して取得
        const { data, error } = await supabase
            .from('event_participants')
            .select(`
        id,
        event_id,
        status,
        registered_at,
        events (*)
      `)
            .eq('user_id', user.id)
            .in('status', ['registered', 'waitlist'])
            .order('registered_at', { ascending: false });

        if (error || !data) {
            console.error('参加予定イベント取得エラー:', error);
            return [];
        }

        // データを変換
        return data
            .filter(item => item.events) // eventsが存在するもののみ
            .map(item => {
                const event = item.events as any;
                return {
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    category: event.category,
                    date: event.date,
                    dayOfWeek: event.dayofweek,
                    period: event.period,
                    location: event.location,
                    minParticipants: event.minparticipants,
                    maxParticipants: event.maxparticipants,
                    currentParticipants: event.currentparticipants,
                    fee: event.fee,
                    languages: event.languages || [],
                    organizer: {
                        id: event.organizer_id || '',
                        name: event.organizer_name || '未設定',
                        avatar: event.organizer_avatar || '',
                    },
                    images: event.images || [],
                    tags: event.tags || [],
                    inoutdoor: event.inoutdoor,
                    registrationId: item.id,
                    registrationStatus: item.status,
                    registeredAt: item.registered_at,
                };
            });
    } catch (error) {
        console.error('参加予定イベント取得エラー:', error);
        return [];
    }
}

/**
 * イベントの参加者リストを取得
 */
export async function getEventParticipants(eventId: string) {
    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from('event_participants')
            .select('*')
            .eq('event_id', eventId)
            .in('status', ['registered', 'waitlist'])
            .order('registered_at', { ascending: true });

        if (error) {
            console.error('参加者リスト取得エラー:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('参加者リスト取得エラー:', error);
        return [];
    }
}
