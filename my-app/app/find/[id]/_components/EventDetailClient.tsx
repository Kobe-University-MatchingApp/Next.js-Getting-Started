'use client';

import { Event } from '@/types/event';
import { getUserEventStatus, cancelEventRegistration } from '@/lib/eventParticipants';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface EventDetailClientProps {
    event: Event;
    isCompleted?: boolean;
}

export default function EventDetailClient({ event, isCompleted = false }: EventDetailClientProps) {
    const router = useRouter();
    const [participationStatus, setParticipationStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    // 参加者が定員に達しているかどうかを判定
    const isFull = event.currentParticipants >= (event.maxParticipants || 0);

    // 参加状態を取得
    useEffect(() => {
        const fetchStatus = async () => {
            const status = await getUserEventStatus(event.id);
            setParticipationStatus(status);
            setLoading(false);
        };
        fetchStatus();
    }, [event.id]);

    // キャンセル処理
    const handleCancel = async () => {
        if (!confirm('参加をキャンセルしますか？')) return;

        setCancelling(true);
        const result = await cancelEventRegistration(event.id);

        if (result.success) {
            alert('参加をキャンセルしました');
            router.refresh();
            setParticipationStatus(null);
        } else {
            alert(result.error || 'キャンセルに失敗しました');
        }
        setCancelling(false);
    };

    // 参加ボタンの表示内容を決定
    const getButtonConfig = () => {
        if (loading) {
            return {
                text: '読み込み中...',
                disabled: true,
                className: 'bg-gray-300 text-white cursor-wait',
                onClick: undefined,
            };
        }

        if (isCompleted) {
            return {
                text: 'このイベントは終了しました',
                disabled: true,
                className: 'bg-gray-300 text-gray-500 cursor-not-allowed',
                onClick: undefined,
            };
        }

        if (participationStatus) {
            if (participationStatus.status === 'registered') {
                return {
                    text: '参加をキャンセル',
                    disabled: cancelling,
                    className: 'bg-red-500 text-white hover:bg-red-600',
                    onClick: handleCancel,
                };
            } else if (participationStatus.status === 'waitlist') {
                return {
                    text: 'キャンセル待ち中',
                    disabled: cancelling,
                    className: 'bg-yellow-500 text-white hover:bg-yellow-600',
                    onClick: handleCancel,
                };
            }
        }

        if (isFull) {
            return {
                text: 'キャンセル待ちに登録',
                disabled: false,
                className: 'bg-yellow-500 text-white hover:bg-yellow-600',
                href: `/find/${event.id}/join`,
            };
        }

        return {
            text: '参加に進む →',
            disabled: false,
            className: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:brightness-110',
            href: `/find/${event.id}/join`,
        };
    };

    const buttonConfig = getButtonConfig();

    return (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-2xl mx-auto flex gap-4 items-center">
                <div className="flex flex-col pl-2">
                    <span className="text-xs text-gray-500">参加費</span>
                    <span className="text-2xl font-bold text-gray-900">¥{(event.fee ?? 0).toLocaleString()}</span>
                </div>

                {buttonConfig.href ? (
                    <Link href={buttonConfig.href} className="flex-1">
                        <button
                            disabled={buttonConfig.disabled}
                            className={`w-full font-bold py-4 px-6 rounded-full shadow-lg transition-all transform active:scale-[0.98] ${buttonConfig.className}`}
                        >
                            {buttonConfig.text}
                        </button>
                    </Link>
                ) : (
                    <button
                        onClick={buttonConfig.onClick}
                        disabled={buttonConfig.disabled}
                        className={`flex-1 font-bold py-4 px-6 rounded-full shadow-lg transition-all transform active:scale-[0.98] ${buttonConfig.className}`}
                    >
                        {buttonConfig.text}
                    </button>
                )}
            </div>
        </div>
    );
}
