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
    minParticipants?: number;
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
    minParticipants?: number;
    maxParticipants: number;
    fee?: number;
    languages: string[];
    tags?: string[];
    inoutdoor?: 'in' | 'out';
}

// イベント参加ステータス
export type ParticipantStatus = 'registered' | 'cancelled' | 'waitlist' | 'attended';

// イベント参加記録
export interface EventParticipant {
    id: string;
    eventId: string;
    userId: string;
    status: ParticipantStatus;
    registeredAt: string;
    cancelledAt?: string;
    notes?: string;
}

// イベント参加者詳細（プロフィール情報含む）
export interface EventParticipantDetail extends EventParticipant {
    participantName: string;
    participantAvatar: string;
}

// ユーザーの参加予定イベント
export interface UserRegisteredEvent extends Event {
    registrationId: string;
    registrationStatus: ParticipantStatus;
    registeredAt: string;
}