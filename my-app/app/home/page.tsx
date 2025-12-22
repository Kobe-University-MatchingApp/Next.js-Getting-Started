'use client';

import EventCard from '@/app/components/EventCard';
import { sampleEvents } from '@/data/events';
import { useState, useEffect } from 'react';

export default function HomePage() {
    // ランダムに2個のイベントを選択（マッチング結果用）
    const [recommendedEvents, setRecommendedEvents] = useState(sampleEvents.slice(0, 2));

    // 予約済みイベント（サンプルとして1個）
    const [bookedEvents] = useState([sampleEvents[0]]);

    useEffect(() => {
        // クライアントサイドでのみランダム選択
        const shuffled = [...sampleEvents].sort(() => Math.random() - 0.5);
        setRecommendedEvents(shuffled.slice(0, 2));
    }, []);

    return (
        <div className="py-3 space-y-3 pb-20">
            {/* アプリタイトル */}
            <div className="bg-white rounded-lg shadow-sm p-4 mx-2">
                <h1 className="text-xl font-bold text-gray-800 mb-2">アプリタイトル - ホーム</h1>
                <p className="text-sm text-gray-600">異文化交流イベント管理アプリ</p>
            </div>

            {/* マッチング結果 */}
            <div className="bg-white rounded-lg shadow-sm p-4 mx-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">マッチングしたおすすめなイベント</h2>
                <div className="space-y-2">
                    {recommendedEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </div>

            {/* 予約済みイベント */}
            <div className="bg-white rounded-lg shadow-sm p-4 mx-2">
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
