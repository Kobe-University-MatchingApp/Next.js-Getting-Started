// 履歴モーダルコンポーネント
'use client';

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
}: HistoryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end mb-0">
            <div className="bg-white w-full rounded-t-2xl max-h-[95vh] overflow-y-auto mb-0">
                {/* モーダルヘッダー */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* コンテンツ */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-600">最新20件</p>
                        <button
                            type="button"
                            onClick={onRefresh}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                            disabled={historyLoading}
                        >
                            更新
                        </button>
                    </div>

                    {historyLoading && (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-500">読み込み中...</p>
                        </div>
                    )}

                    {historyError && (
                        <div className="text-center py-8">
                            <p className="text-sm text-red-600">{historyError}</p>
                        </div>
                    )}

                    {!historyLoading && !historyError && historyEvents.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-500">履歴がありません</p>
                        </div>
                    )}

                    {/* イベント一覧 */}
                    <div className="space-y-2">
                        {historyEvents.map((row) => {
                            const status = computeStatus(row?.date);
                            const editable = canEditEvent(row);
                            const dateText = String(row?.date ?? '');
                            const langs = Array.isArray(row?.languages) ? row.languages : [];

                            return (
                                <div
                                    key={row.id}
                                    className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-gray-800 mb-1">
                                                {String(row?.title ?? '無題')}
                                            </h3>
                                            <div className="flex flex-wrap gap-1 mb-1">
                                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium">
                                                    {String(row?.category ?? '未設定')}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status === 'completed'
                                                    ? 'bg-gray-100 text-gray-600'
                                                    : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {status === 'completed' ? 'completed' : 'hold'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-600">
                                                {dateText || '日時未設定'} ・ {String(row?.location ?? '場所未設定')}
                                            </p>
                                            {langs.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {langs.map((lang: string, idx: number) => (
                                                        <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px]">
                                                            {lang}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onSelectEvent(row)}
                                            disabled={mode === 'edit' && !editable}
                                            className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'edit' && !editable
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : mode === 'template'
                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                        >
                                            {mode === 'template' ? 'これで作成' : '編集'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
