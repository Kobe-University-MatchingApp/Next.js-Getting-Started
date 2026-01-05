import { supabase } from '@/lib/supabaseClient';
import { transformSupabaseEventRows } from '@/lib/transformers/eventTransformer';
import { Event } from '@/types/event';

// フィルタータイプの定義
export type FilterType = 'all' | 'interests' | 'history' | 'department' | 'upcoming';

// カテゴリ別イベントの型定義
export interface CategorizedEvents {
    interests: Event[];
    history: Event[];
    department: Event[];
    upcoming: Event[];
    all: Event[];
}

/**
 * 現在のユーザー名を取得する関数
 * 実際の実装では認証情報から取得しますが、今はサンプルユーザー名を返します
 */
export async function getCurrentUserName(): Promise<string> {
    // TODO: 実際の認証システムと連携してユーザー名を取得
    // 例: const { data } = await supabase.auth.getUser();
    return 'ユーザー';
}

/**
 * ホーム画面用のカテゴリ別イベントを取得する関数
 */
export async function getHomeEvents(): Promise<CategorizedEvents> {
    // Supabaseから全イベントを取得
    const { data, error } = await supabase.from('events').select('*');

    let allEvents: Event[] = [];
    if (!error && data) {
        allEvents = transformSupabaseEventRows(data);
    } else {
        console.error('Supabaseからのデータ取得エラー:', error);
    }

    // カテゴリごとにイベントを分類
    const categorizedEvents: CategorizedEvents = {
        all: allEvents,
        interests: [],
        history: [],
        department: [],
        upcoming: []
    };

    // 🎯 興味タグに基づく推奨
    // TODO: ユーザーの興味タグを取得してマッチング
    // 現在はサンプルとして最初の3つを表示
    categorizedEvents.interests = allEvents.slice(0, 3);

    // 📚 過去の履歴に基づく推奨
    // TODO: ユーザーの参加履歴から類似イベントを推奨
    // 現在はサンプルとして次の3つを表示
    categorizedEvents.history = allEvents.slice(1, 4);

    // 🏫 学部のおすすめ
    // TODO: ユーザーの学部情報に基づいて推奨
    // 現在はサンプルとして別の3つを表示
    categorizedEvents.department = allEvents.slice(2, 5);

    // 🔥 開催間近のイベント
    // 日付順にソートして最も近いイベントを取得
    const sortedByDate = [...allEvents].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    categorizedEvents.upcoming = sortedByDate.slice(0, 3);

    return categorizedEvents;
}
