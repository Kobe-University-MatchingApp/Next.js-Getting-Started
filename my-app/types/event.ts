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
