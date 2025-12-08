export interface Event {
    id: string;
    title: string;
    description: string;
    category: EventCategory;
    date: string;
    time: string;
    location: string;
    maxParticipants: number;
    currentParticipants: number;
    fee?: number; // 0 = 無料など、DBでは NOT NULL + default 0 を推奨
    languages: string[]; // 空配列の場合でも [] を保存
    organizer: {
        id: string;
        name: string;
        avatar: string;
        rating?: {
            average: number; // 0〜5, DB default 0
            count: number;   // DB default 0
        };
    };
    images?: string[]; // 画像URL一覧。DB default [] 推奨
    introvertExtrovertStats?: {
        introvertCount: number; // DB default 0
        extrovertCount: number; // DB default 0
    };
    tags?: string[]; // DB default [] 推奨
}

export type EventCategory =
    | '言語交換'
    | '料理体験'
    | '文化体験'
    | 'スポーツ'
    | '観光'
    | 'その他';

export interface EventFormData {
    title: string;
    description: string;
    category: EventCategory;
    date: string;
    time: string;
    location: string;
    maxParticipants: number;
    fee?: number; // 未設定時は 0 として扱う想定
    languages: string[]; // UI では必須、DB では NOT NULL default []
    images?: string[]; // 未設定時は []
    tags?: string[]; // 未設定時は []
}

/**
 * 将来のDB/MySQL用インターフェース（まだ実装しない）
 * - APIルート or サーバーコンポーネントから実装する想定
 * - 今は「どんなメソッドをDBに対して用意するか」のメモだけ
 */
// export interface EventRepository {
//     /** イベント一覧取得 */
//     listEvents(): Promise<Event[]>;
//
//     /** ID指定で1件取得（見つからなければ null） */
//     getEventById(id: string): Promise<Event | null>;
//
//     /** イベント作成（フォーム入力 + 主催者ID） */
//     createEvent(input: EventFormData & { organizerId: string }): Promise<Event>;
//
//     /** イベント更新（部分更新を想定） */
//     updateEvent(id: string, patch: Partial<EventFormData>): Promise<Event | null>;
//
//     /** イベント削除 */
//     deleteEvent(id: string): Promise<void>;
//
//     /** I/E集計値の更新（将来、event_attendeesテーブルから集計する想定） */
//     updateIntrovertExtrovertStats(
//         eventId: string,
//         stats: { introvertCount: number; extrovertCount: number }
//     ): Promise<void>;
//
//     /** 主催者評価の集計値を更新 */
//     updateOrganizerRating(
//         organizerId: string,
//         summary: { average: number; count: number }
//     ): Promise<void>;
// }
