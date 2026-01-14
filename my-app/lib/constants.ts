import { EventCategory } from '@/types/event';

/**
 * 曜日の定義
 */
export const DAYS_OF_WEEK = [
    { id: 'mon', label: '月' },
    { id: 'tue', label: '火' },
    { id: 'wed', label: '水' },
    { id: 'thu', label: '木' },
    { id: 'fri', label: '金' },
] as const;

/**
 * 時限の定義（神戸大学の時間割）
 */
export const PERIODS = [
    { id: 1, label: '1限', time: '08:50-10:20' },
    { id: 2, label: '2限', time: '10:40-12:10' },
    { id: 3, label: '3限', time: '13:20-14:50' },
    { id: 4, label: '4限', time: '15:10-16:40' },
    { id: 5, label: '5限', time: '17:00-18:30' },
] as const;

/**
 * イベントカテゴリー
 */
export const EVENT_CATEGORIES: EventCategory[] = [
    '言語交換',
    '料理体験',
    '文化体験',
    'スポーツ',
    '観光',
    'その他',
];

/**
 * 利用可能な言語リスト
 */
export const AVAILABLE_LANGUAGES = [
    '日本語',
    '英語',
    '中国語',
    '韓国語',
    'スペイン語',
    'フランス語',
    'ドイツ語',
    'ポルトガル語',
    'その他',
] as const;

/**
 * 利用可能な場所リスト
 */
export const AVAILABLE_LOCATIONS = [
    '食堂',
    'スターバックス',
    'ラーニングコモンズ',
    '学生会館',
    '教室',
] as const;

/**
 * 利用可能な趣味タグ
 */
export const AVAILABLE_TAGS = [
    'カフェ',
    '料理',
    '音楽',
    '映画',
    '読書',
    '写真',
    'スポーツ',
    'アウトドア',
    '旅行',
    'アート',
    'ファッション',
] as const;

// ProfileFormで使用するためのエイリアスと追加定数
export const INTERESTS = AVAILABLE_TAGS;
export const LANGUAGES = AVAILABLE_LANGUAGES;

export const OCCUPATIONS = [
    '学部生（1年）',
    '学部生（2年）',
    '学部生（3年）',
    '学部生（4年）',
    '大学院生（修士）',
    '大学院生（博士）',
    '留学生',
    '教職員',
    'その他',
] as const;

export const LANGUAGE_LEVELS = [
    { value: 'beginner', label: '初級' },
    { value: 'intermediate', label: '中級' },
    { value: 'advanced', label: '上級' },
    { value: 'native', label: 'ネイティブ' },
] as const;

/**
 * ユーティリティ関数：曜日IDからラベルを取得
 */
export function getDayLabel(dayId: string): string {
    return DAYS_OF_WEEK.find(d => d.id === dayId)?.label || dayId;
}

/**
 * ユーティリティ関数：時限IDからラベルを取得
 */
export function getPeriodLabel(periodId: number): string {
    return PERIODS.find(p => p.id === periodId)?.label || `${periodId}限`;
}

/**
 * ユーティリティ関数：時限IDから時刻を取得
 */
export function getPeriodTime(periodId: number): string | undefined {
    return PERIODS.find(p => p.id === periodId)?.time;
}

/**
 * ユーティリティ関数：時限オブジェクトを取得
 */
export function getPeriod(periodId: number) {
    return PERIODS.find(p => p.id === periodId);
}

/**
 * ユーティリティ関数：曜日オブジェクトを取得
 */
export function getDay(dayId: string) {
    return DAYS_OF_WEEK.find(d => d.id === dayId);
}
