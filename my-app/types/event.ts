// イベントに関する型定義
export interface Event {
    id: string;
    title: string;
    description: string;
    category: EventCategory;
    date: string;
    dayOfWeek: string; // 'mon', 'tue', 'wed', 'thu', 'fri'
    period: number; // 1-5 (1コマ90分固定)
    location: string;
    maxParticipants: number;
    currentParticipants: number;
    fee?: number;
    languages: string[];
    organizer: {
        id: string;
        name: string;
        avatar: string;
    };
    images?: string[];
    tags?: string[];
    inoutdoor?: 'in' | 'out';
}

// イベントカテゴリーの定義
export type EventCategory =
    | '言語交換'
    | '料理体験'
    | '文化体験'
    | 'スポーツ'
    | '観光'
    | 'その他';

// イベント作成フォームのデータ型
export interface EventFormData {
    title: string;
    description: string;
    category: EventCategory;
    date: string;
    dayOfWeek: string;
    period: number;
    location: string;
    // Minimum required participants (DB column: minparticipants)
    minParticipants?: number;
    maxParticipants: number;
    fee?: number;
    languages: string[];
    tags?: string[];
    inoutdoor?: 'in' | 'out';
}
