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

// モックのユーザー情報
// TODO: 実際の認証システムと連携してユーザー情報を取得
const mockUser = {
    id: 'current-user',
    name: '田中 太郎',
    faculty: '国際学部',
    interests: ['言語交換', 'カフェ', '英語'], // 基準1: 登録タグ
    historyCategories: ['言語交換'],           // 基準2: 過去参加ジャンル
};

/**
 * 現在のユーザー名を取得する関数
 */
export async function getCurrentUserName(): Promise<string> {
    // TODO: 実際の認証システムと連携してユーザー名を取得
    // 例: const { data } = await supabase.auth.getUser();
    return mockUser.name;
}

/**
 * ホーム画面用のカテゴリ別イベントを取得する関数
 * ユーザーの興味、履歴、学部に基づいてパーソナライズされた推奨を提供
 */
export async function getHomeEvents(): Promise<CategorizedEvents> {
    const today = new Date();

    // Supabaseから全イベントを取得
    const { data, error } = await supabase.from('events').select('*');

    let allEvents: Event[] = [];
    if (!error && data) {
        allEvents = transformSupabaseEventRows(data);
    } else {
        console.error('Supabaseからのデータ取得エラー:', error);
        return {
            all: [],
            interests: [],
            history: [],
            department: [],
            upcoming: []
        };
    }

    // 🎯 興味タグに基づく推奨
    // ユーザーの興味タグとイベントのタグをマッチング
    const byInterests = allEvents.filter(event =>
        event.tags?.some(tag => mockUser.interests.includes(tag))
    );

    // 📚 過去の履歴に基づく推奨
    // 過去参加したカテゴリと一致するイベント（重複を避ける）
    const byHistory = allEvents.filter(event =>
        mockUser.historyCategories.includes(event.category) &&
        !byInterests.includes(event)
    );

    // 🏫 学部のおすすめ
    // 同じ学部/研究科に関連（タグや説明文で判定）
    const byDepartment = allEvents.filter(event =>
        (event.tags?.includes('国際') || event.description.includes('国際') ||
            event.tags?.some(tag => tag.includes(mockUser.faculty.replace('学部', '')))) &&
        !byInterests.includes(event) &&
        !byHistory.includes(event)
    );

    // 🔥 開催間近のイベント
    // 7日以内 & 定員50%以下のイベント
    const byUpcoming = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        const daysDiff = (eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
        const fillRate = event.currentParticipants / (event.maxParticipants || 1);

        return daysDiff >= 0 && daysDiff <= 7 && fillRate < 0.5 &&
            !byInterests.includes(event) &&
            !byHistory.includes(event) &&
            !byDepartment.includes(event);
    });

    return {
        all: allEvents,
        interests: byInterests,
        history: byHistory,
        department: byDepartment,
        upcoming: byUpcoming
    };
}
