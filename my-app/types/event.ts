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
    fee?: number;
    languages: string[];
    organizer: {
        id: string;
        name: string;
        avatar: string;
    };
    images?: string[];
    tags?: string[];
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
    fee?: number;
    languages: string[];
    tags?: string[];
}
