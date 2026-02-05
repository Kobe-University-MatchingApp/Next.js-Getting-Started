// 履歴モーダルコンポーネント
'use client';

import { useEffect } from 'react';
import { useModal } from '@/app/_contexts/ModalContext';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    historyLoading: boolean;
    historyError: string | null;
    historyEvents: any[];
    onRefresh: () => void;
    onSelectEvent: (row: any) => void;
    mode: 'template' | 'edit';
    canEditEvent: (row: any) => boolean;
    computeStatus: (dateText: string | null | undefined) => 'hold' | 'completed';
    isOwnEvent?: (row: any) => boolean;
}

export default function HistoryModal({
    isOpen,
    onClose,
    title,
    historyLoading,
    historyError,
    historyEvents,
    onRefresh,
    onSelectEvent,
    mode,
    canEditEvent,
    computeStatus,
    isOwnEvent,
}: HistoryModalProps) {
    // モーダルコンテキストを使用してボトムナビを制御
    const { setIsModalOpen } = useModal();

    // モーダルの開閉に応じてボトムナビを制御し、背後のスクロールを防止
    useEffect(() => {
        if (isOpen) {
            setIsModalOpen(true);
            document.body.style.overflow = 'hidden';
            return () => {
                setIsModalOpen(false);
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen, setIsModalOpen]);

    if (!isOpen) return null;

    // 編集モードの場合、フィルタリング後のイベント一覧を取得
    const filteredEvents = mode === 'edit'
        ? historyEvents.filter((row) => {
            const status = computeStatus(row?.date);
            return status !== 'completed';
        })
        : historyEvents;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
            onClick={(e) => {
                // 背景をクリックしても閉じないようにする
                if (e.target === e.currentTarget) {
                    e.stopPropagation();
                }
            }}
        >
            <div className="bg-white dark:bg-gray-900 w-full md:w-[90%] md:max-w-2xl md:rounded-2xl rounded-t-2xl max-h-[95vh] md:max-h-[85vh] overflow-y-auto shadow-2xl">
                {/* モーダルヘッダー */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{mode === 'template' ? '📝' : '✏️'}</span>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* コンテンツ */}
                <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {mode === 'template'
                                ? '過去のイベントをテンプレートとして使用'
                                : '未完了のイベントのみ編集可能'}
                        </p>
                        <button
                            type="button"
                            onClick={onRefresh}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                            disabled={historyLoading}
                        >
                            🔄 更新
                        </button>
                    </div>

                    {historyLoading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">読み込み中...</p>
                        </div>
                    )}

                    {historyError && (
                        <div className="text-center py-12">
                            <p className="text-4xl mb-2">😢</p>
                            <p className="text-sm text-red-600 dark:text-red-400">{historyError}</p>
                        </div>
                    )}

                    {!historyLoading && !historyError && filteredEvents.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-4xl mb-2">📭</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {mode === 'edit' ? '編集可能なイベントがありません' : '履歴がありません'}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {mode === 'edit'
                                    ? '未完了のイベントを作成すると、ここに表示されます'
                                    : 'イベントを作成すると、ここに表示されます'}
                            </p>
                        </div>
                    )}

                    {/* イベント一覧 - PC向けグリッド */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredEvents.map((row) => {
                            const status = computeStatus(row?.date);
                            const editable = canEditEvent(row);
                            const isOwn = isOwnEvent ? isOwnEvent(row) : true;
                            const dateText = String(row?.date ?? '');
                            const langs = Array.isArray(row?.languages) ? row.languages : [];

                            return (
                                <div
                                    key={row.id}
                                    className={`bg-white dark:bg-gray-800 border rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${mode === 'edit' && !editable
                                        ? 'border-gray-200 dark:border-gray-700 opacity-60'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1.5 truncate">
                                                {String(row?.title ?? '無題')}
                                            </h3>
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-medium">
                                                    {String(row?.category ?? '未設定')}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status === 'completed'
                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                    : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                                                    }`}>
                                                    {status === 'completed' ? '終了' : '開催予定'}
                                                </span>
                                                {!isOwn && (
                                                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-medium">
                                                        他の主催者
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <span>📅</span> {dateText || '日時未設定'}
                                            </p>
                                            <p className="text-[11px] text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                                <span>📍</span> {String(row?.location ?? '場所未設定')}
                                            </p>
                                            {langs.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {langs.slice(0, 3).map((lang: string, idx: number) => (
                                                        <span key={idx} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[9px]">
                                                            {lang}
                                                        </span>
                                                    ))}
                                                    {langs.length > 3 && (
                                                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-[9px]">
                                                            +{langs.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onSelectEvent(row)}
                                        disabled={mode === 'edit' && !editable}
                                        className={`w-full mt-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'edit' && !editable
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : mode === 'template'
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                            }`}
                                    >
                                        {mode === 'template' ? '📋 これをテンプレートに' : '✏️ 編集する'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* フッター説明 */}
                    {historyEvents.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
                                {mode === 'template'
                                    ? '※ テンプレートとして使用した場合、日時は新しく設定する必要があります'
                                    : '※ 開催日を過ぎたイベントは編集できません'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
