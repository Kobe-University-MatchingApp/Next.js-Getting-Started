// イベントカードのコンポーネント

import Link from 'next/link';
import { Event } from '@/types/event';
import { DAYS_OF_WEEK, PERIODS } from '@/lib/constants';
import { isEventCompleted } from '@/lib/utils/eventStatus';

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {
    const isCompleted = isEventCompleted(event.date);

    return (
        <Link href={`/find/${event.id}`}>
            <div className={`border-b border-gray-200 transition-colors p-4 ${isCompleted
                    ? 'bg-gray-100 hover:bg-gray-150 opacity-75'
                    : 'bg-white hover:bg-gray-50'
                }`}>
                {/* タイトルとカテゴリー */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 flex items-start gap-2">
                        <h3 className={`text-base font-semibold line-clamp-2 ${isCompleted ? 'text-gray-500' : 'text-gray-900'
                            }`}>
                            {event.title}
                        </h3>
                        {isCompleted && (
                            <span className="px-2 py-0.5 bg-gray-400 text-white rounded text-xs font-medium whitespace-nowrap shrink-0">
                                終了
                            </span>
                        )}
                    </div>
                    <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium whitespace-nowrap shrink-0">
                        {event.category}
                    </span>
                </div>

                {/* 日時・場所 */}
                <div className={`space-y-1.5 text-sm mb-3 ${isCompleted ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">📅</span>
                        <span>
                            {event.date} · {DAYS_OF_WEEK.find(d => d.id === event.dayOfWeek)?.label}曜{PERIODS.find(p => p.id === event.period)?.label} ({PERIODS.find(p => p.id === event.period)?.time})
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">📍</span>
                            <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">👥</span>
                            <span>{event.currentParticipants}/{event.maxParticipants}人</span>
                        </div>
                    </div>
                </div>

                {/* 下部情報 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        {event.organizer.avatar && event.organizer.avatar.trim() !== '' ? (
                            <img 
                                src={event.organizer.avatar} 
                                alt={event.organizer.name} 
                                className="w-6 h-6 rounded-full object-cover" 
                                onError={(e) => {
                                    // 画像読み込みエラー時の処理
                                    const img = e.target as HTMLImageElement;
                                    img.style.display = 'none';
                                    if (img.nextElementSibling) {
                                        (img.nextElementSibling as HTMLElement).style.display = 'flex';
                                    }
                                }}
                            />
                        ) : null}
                        {!event.organizer.avatar || event.organizer.avatar.trim() === '' ? (
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 font-semibold">
                                {event.organizer.name.charAt(0)}
                            </div>
                        ) : null}
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
