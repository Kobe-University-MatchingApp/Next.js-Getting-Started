import { Event } from '@/types/event';

/**
 * JSON文字列をパースするヘルパー関数
 * @param value パース対象の値
 * @param defaultValue パース失敗時のデフォルト値
 * @returns パースされた値またはデフォルト値
 */
function parseJsonField<T>(value: any, defaultValue?: T): T | undefined {
    // すでに配列の場合はそのまま返す
    if (Array.isArray(value)) {
        return (value.length > 0 ? value : defaultValue) as T | undefined;
    }

    // 文字列の場合はパースを試みる
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            // 空配列の場合はundefinedまたはデフォルト値を返す
            if (Array.isArray(parsed) && parsed.length === 0) {
                return defaultValue;
            }
            return parsed as T;
        } catch (e) {
            console.error('JSON parse error:', e);
            return defaultValue;
        }
    }

    return defaultValue;
}

/**
 * Supabaseのフィールド名を正規化する
 * snake_case、lowercase、camelCaseのいずれかから値を取得
 */
function getFieldValue(row: any, ...fieldNames: string[]): any {
    for (const name of fieldNames) {
        if (row[name] !== undefined && row[name] !== null) {
            return row[name];
        }
    }
    return undefined;
}

/**
 * Supabaseの行データをEventオブジェクトに変換
 * @param row Supabaseから取得した生データ
 * @returns Event型のオブジェクト
 */
export function transformSupabaseEventRow(row: any): Event {
    // 言語配列のパース
    const languages = parseJsonField<string[]>(row.languages, []) || [];

    // タグ配列のパース（オプショナル）
    const tags = parseJsonField<string[]>(row.tags);

    // 画像配列のパース（オプショナル）
    const images = parseJsonField<string[]>(row.images);

    return {
        id: String(row.id ?? ''),
        title: String(row.title ?? ''),
        description: String(row.description ?? ''),
        category: (row.category ?? 'その他') as Event['category'],
        date: String(row.date ?? ''),

        // Supabaseのフィールド名は小文字、snake_case、camelCaseのいずれかの可能性
        dayOfWeek: String(
            getFieldValue(row, 'dayofweek', 'day_of_week', 'dayOfWeek') ?? 'mon'
        ),
        period: Number(row.period ?? 1),
        location: String(row.location ?? ''),

        // 参加者数のフィールド
        maxParticipants: Number(
            getFieldValue(row, 'maxparticipants', 'max_participants', 'maxParticipants') ?? 0
        ),
        currentParticipants: Number(
            getFieldValue(row, 'currentparticipants', 'current_participants', 'currentParticipants') ?? 0
        ),

        // 参加費（オプショナル）
        fee: typeof row.fee === 'number' ? row.fee : undefined,

        // パース済みの配列
        languages,

        // 主催者情報
        organizer: {
            id: String(getFieldValue(row, 'organizer_id', 'organizerId') ?? 'unknown'),
            name: String(getFieldValue(row, 'organizer_name', 'organizerName') ?? '未設定'),
            avatar: String(getFieldValue(row, 'organizer_avatar', 'organizerAvatar') ?? ''),
        },

        // オプショナルフィールド
        images,
        tags,
    };
}

/**
 * Supabaseの行データ配列をEvent配列に変換
 * @param rows Supabaseから取得した生データの配列
 * @returns Event型のオブジェクト配列
 */
export function transformSupabaseEventRows(rows: any[]): Event[] {
    if (!Array.isArray(rows)) {
        return [];
    }

    return rows.map(transformSupabaseEventRow);
}
