// イベントのステータス判定ユーティリティ

/**
 * イベントが終了しているかどうかを判定
 * @param dateText イベントの日時文字列
 * @returns 終了している場合true
 */
export function isEventCompleted(dateText: string | null | undefined): boolean {
    if (!dateText) return false;

    // ISO形式に変換（スペース区切りの場合はTに変換）
    const isoCandidate = dateText.includes('T') ? dateText : dateText.replace(' ', 'T');
    const eventDate = new Date(isoCandidate);

    // 日付が無効な場合は終了していないとみなす
    if (isNaN(eventDate.getTime())) return false;

    // イベント日時が現在時刻より前なら終了
    return eventDate.getTime() < Date.now();
}

/**
 * イベントのステータスを取得
 * @param dateText イベントの日時文字列
 * @returns 'hold' (開催予定) | 'completed' (終了)
 */
export function getEventStatus(dateText: string | null | undefined): 'hold' | 'completed' {
    return isEventCompleted(dateText) ? 'completed' : 'hold';
}

/**
 * 日時文字列をフォーマット
 * @param dateText 日時文字列
 * @returns フォーマット済み日時文字列
 */
export function formatEventDate(dateText: string | null | undefined): string {
    if (!dateText) return '';

    try {
        const isoCandidate = dateText.includes('T') ? dateText : dateText.replace(' ', 'T');
        const date = new Date(isoCandidate);

        if (isNaN(date.getTime())) return dateText;

        // 日本語形式でフォーマット
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();

        return `${year}/${month}/${day} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch {
        return dateText;
    }
}
