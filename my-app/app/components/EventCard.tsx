import Link from 'next/link';
import { Event } from '@/types/event';

interface EventCardProps {
    event: Event;
}

const daysOfWeek = [
    { id: 'mon', label: '月' },
    { id: 'tue', label: '火' },
    { id: 'wed', label: '水' },
    { id: 'thu', label: '木' },
    { id: 'fri', label: '金' },
];

const periods = [
    { id: 1, label: '1限', time: '09:00-10:30' },
    { id: 2, label: '2限', time: '10:40-12:10' },
    { id: 3, label: '3限', time: '13:10-14:40' },
    { id: 4, label: '4限', time: '14:50-16:20' },
    { id: 5, label: '5限', time: '16:30-18:00' },
];

export default function EventCard({ event }: EventCardProps) {
    return (
        <Link href={`/find/${event.id}`}>
            <div className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors p-4">
                {/* タイトルとカテゴリー */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1">
                        {event.title}
                    </h3>
                    <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium whitespace-nowrap">
                        {event.category}
                    </span>
                </div>

                {/* 日時・場所 */}
                <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">📅</span>
                        <span>
                            {event.date} · {daysOfWeek.find(d => d.id === event.dayOfWeek)?.label}曜{periods.find(p => p.id === event.period)?.label} ({periods.find(p => p.id === event.period)?.time})
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">📍</span>
                        <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">👥</span>
                        <span>{event.currentParticipants}/{event.maxParticipants}人</span>
                    </div>
                </div>

                {/* 下部情報 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        {event.organizer.avatar ? (
                            <img src={event.organizer.avatar} alt={event.organizer.name} className="w-6 h-6 rounded-full" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                                {event.organizer.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-sm text-gray-600">{event.organizer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {event.languages.slice(0, 2).map((lang) => (
                            <span key={lang} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
}
