// ホームのページコンポーネント

import EventCard from '@/app/_components/EventCard';
import { supabase } from '@/lib/supabaseClient';
import { transformSupabaseEventRows } from '@/lib/transformers/eventTransformer';
import { Event } from '@/types/event';

export default async function HomePage() {

    // Supabaseからイベントを取得
    const { data, error } = await supabase.from('events').select('*');

    let allEvents: Event[] = [];
    if (!error && data) {
        allEvents = transformSupabaseEventRows(data);
    } else {
        console.error('Supabaseからのデータ取得エラー:', error);
    }

    // ランダムに2個のイベントを選択（マッチング結果用）
    const shuffled = [...allEvents].sort(() => Math.random() - 0.5);
    const recommendedEvents = shuffled.slice(0, 2);

    // 予約済みイベント（サンプルとして1個、実際にはユーザーの予約情報から取得）
    const bookedEvents = allEvents.length > 0 ? [allEvents[0]] : [];

    return (
        <div className="py-3 space-y-3 min-h-screen pb-20">
            {/* ヘッダー */}
            <div className="bg-white border-b border-gray-200 p-4 mx-0">
                <h1 className="text-xl font-bold text-gray-900">ホーム</h1>
            </div>

            {/* マッチング結果 */}
            <div className="bg-white border-b border-gray-200 p-4 mx-0">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">マッチングしたおすすめなイベント</h2>
                <div className="space-y-2">
                    {recommendedEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </div>

            {/* 予約済みイベント */}
            <div className="bg-white border-b border-gray-200 p-4 mx-0">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">予約済みイベント</h2>
                <div className="space-y-2">
                    {bookedEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </div>
        </div>
    );
}
