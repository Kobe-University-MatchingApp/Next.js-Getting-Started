// ホームのページコンポーネント

'use client';

import EventCard from '@/app/_components/EventCard';
import { sampleEvents } from '@/data/events';
import { useState, useEffect } from 'react';

export default function HomePage() {

    // ランダムに2個のイベントを選択（マッチング結果用）
    const [recommendedEvents, setRecommendedEvents] = useState(sampleEvents.slice(0, 2));

    // 予約済みイベント（サンプルとして1個）
    const [bookedEvents] = useState([sampleEvents[0]]);

    // コンポーネントマウント時にランダムに2個のイベントを選択
    useEffect(() => {
        const shuffled = [...sampleEvents].sort(() => Math.random() - 0.5);
        setRecommendedEvents(shuffled.slice(0, 2));
    }, []);

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
