'use client';

import { useEffect, useState } from 'react';
import { getUserRegisteredEvents } from '@/lib/eventParticipants';
import { UserRegisteredEvent } from '@/types/event';
import Link from 'next/link';

export default function RegisteredEvents() {
    const [events, setEvents] = useState<UserRegisteredEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const data = await getUserRegisteredEvents();
            setEvents(data);
            setLoading(false);
        };
        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div className="bg-white border-b border-gray-200 p-4 mx-0">
                <h3 className="text-sm font-bold text-gray-800 mb-2">📅 参加予定のイベント</h3>
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="bg-white border-b border-gray-200 p-4 mx-0">
                <h3 className="text-sm font-bold text-gray-800 mb-2">📅 参加予定のイベント</h3>
                <p className="text-sm text-gray-500 text-center py-4">
                    参加予定のイベントはありません
                </p>
                <Link href="/find" className="block text-center mt-2">
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                        イベントを探す
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white border-b border-gray-200 p-4 mx-0">
            <h3 className="text-sm font-bold text-gray-800 mb-3">📅 参加予定のイベント</h3>
            <div className="space-y-3">
                {events.map((event) => (
                    <Link
                        key={event.registrationId}
                        href={`/find/${event.id}`}
                        className="block"
                    >
                        <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition border border-gray-200">
                            <div className="flex gap-3">
                                <img
                                    src={event.images?.[0] || 'https://placehold.jp/100x100.png'}
                                    alt={event.title}
                                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                                            {event.title}
                                        </h4>
                                        {event.registrationStatus === 'waitlist' && (
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full shrink-0">
                                                待機中
                                            </span>
                                        )}
                                        {event.registrationStatus === 'registered' && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">
                                                参加予定
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
                                    <p className="text-xs text-gray-500">🕒 {event.date}</p>
                                    <p className="text-xs font-medium text-purple-600 mt-1">
                                        ¥{(event.fee ?? 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
