'use client';

import { useCallback, useEffect, useState } from 'react';
import HistoryModal from './_components/HistoryModal';
import { createClient } from '@/utils/supabase/client';
import { logger } from '@/lib/utils/logger';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabase = createClient();

// ローカルストレージキー
const DRAFT_KEY = 'event_draft';

export default function CreateEventPage() {
    const router = useRouter();

    // ユーザー認証状態 - UUID, shortId, name を取得
    const [currentUser, setCurrentUser] = useState<{
        id: string;
        shortId: string | null;
        name: string | null;
    } | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // History state
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [historyEvents, setHistoryEvents] = useState<any[]>([]);

    // 下書き状態
    const [hasDraft, setHasDraft] = useState(false);

    // ユーザー認証とprofile情報取得
    useEffect(() => {
        const fetchUser = async () => {
            setAuthLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // profilesテーブルからshort_idとnameを取得
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('short_id, name')
                        .eq('id', user.id)
                        .single();

                    setCurrentUser({
                        id: user.id,  // UUID
                        shortId: profile?.short_id ?? null,
                        name: profile?.name ?? null,
                    });
                } else {
                    setCurrentUser(null);
                }
            } catch (err) {
                logger.error('Auth error:', err);
                setCurrentUser(null);
            } finally {
                setAuthLoading(false);
            }
        };
        fetchUser();
    }, []);

    // 下書きチェック
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const draft = localStorage.getItem(DRAFT_KEY);
            setHasDraft(!!draft);
        }
    }, []);

    // 下書き削除
    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setHasDraft(false);
    };

    const computeStatus = (dateText: string | null | undefined) => {
        if (!dateText) return 'hold' as const;
        const d = new Date(dateText);
        if (Number.isNaN(d.getTime())) return 'hold' as const;
        return d.getTime() < Date.now() ? ('completed' as const) : ('hold' as const);
    };

    // 自分が作成したイベントかどうか（UUIDで比較）
    const isOwnEvent = (row: any) => {
        if (!currentUser?.id) return false;
        return row?.organizer_id === currentUser.id;
    };

    const canEditEvent = (row: any) => {
        const isHold = computeStatus(row?.date) === 'hold';
        const isOwn = isOwnEvent(row);
        return isHold && isOwn;
    };

    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        setHistoryError(null);

        try {
            let query = supabase
                .from('events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            // ログイン中ならUUIDで自分のイベントのみ取得
            if (currentUser?.id) {
                query = query.eq('organizer_id', currentUser.id);
            }

            const { data, error } = await query;

            if (error) throw error;
            setHistoryEvents(data ?? []);

        } catch (err: any) {
            setHistoryError(err?.message ?? '履歴の取得に失敗しました');
        } finally {
            setHistoryLoading(false);
        }
    }, [currentUser]);

    const openTemplateHistory = async () => {
        if (!currentUser) {
            alert('履歴機能を使用するにはログインが必要です');
            return;
        }
        setIsTemplateModalOpen(true);
        await fetchHistory();
    };

    const openEditHistory = async () => {
        if (!currentUser) {
            alert('編集機能を使用するにはログインが必要です');
            return;
        }
        setIsEditModalOpen(true);
        await fetchHistory();
    };

    // テンプレートを選択したら新規作成ページへ遷移
    const onSelectTemplate = (row: any) => {
        const templateData = {
            formData: {
                title: String(row?.title ?? ''),
                description: String(row?.description ?? ''),
                category: (row?.category ?? '言語交換') as any,
                date: '',
                dayOfWeek: String(row?.dayofweek ?? row?.dayOfWeek ?? 'mon'),
                period: Number(row?.period ?? 1),
                location: String(row?.location ?? ''),
                minParticipants: Number(row?.minparticipants ?? row?.minParticipants ?? 2),
                maxParticipants: Number(row?.maxparticipants ?? row?.maxParticipants ?? 10),
                fee: typeof row?.fee === 'number' ? row.fee : 0,
                tags: Array.isArray(row?.tags) ? row.tags : [],
                inoutdoor: row?.inoutdoor === 'out' ? 'out' : row?.inoutdoor === 'in' ? 'in' : 'in',
            },
            languages: Array.isArray(row?.languages) ? row.languages : [],
            images: Array.isArray(row?.images) ? row.images : [],
            time: '',
        };
        const encoded = encodeURIComponent(JSON.stringify(templateData));
        router.push(`/create/new?data=${encoded}`);
    };

    // 編集を選択したら編集ページへ遷移
    const onSelectEdit = (row: any) => {
        if (!canEditEvent(row)) return;
        router.push(`/create/edit/${row.id}`);
    };

    return (
        <div className="py-4 md:py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* ヘッダー */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                                イベント作成
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {authLoading
                                    ? '認証確認中...'
                                    : currentUser
                                        ? `ログイン中: ${currentUser.name ?? '名前未設定'}`
                                        : 'ゲストモード（一部機能制限あり）'
                                }
                            </p>
                        </div>
                        <Link
                            href="/create/new"
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all md:w-auto w-full text-center"
                        >
                            ✨ 新規作成
                        </Link>
                    </div>
                </div>

                {/* メインコンテンツ - PC向け2カラム */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 履歴からの操作 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <span className="text-xl">📋</span> 履歴から操作
                        </h2>
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={openTemplateHistory}
                                disabled={!currentUser}
                                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <span>📝</span> 履歴から作成
                            </button>
                            <button
                                type="button"
                                onClick={openEditHistory}
                                disabled={!currentUser}
                                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <span>✏️</span> 未完了イベントを編集
                            </button>
                            {!currentUser && !authLoading && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                                    ※ ログインすると履歴機能が使えます
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 下書き */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <span className="text-xl">💾</span> 下書き
                        </h2>
                        {hasDraft ? (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    保存された下書きがあります
                                </p>
                                <div className="flex gap-2">
                                    <Link
                                        href="/create/new"
                                        className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors text-center"
                                    >
                                        下書きを開く
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={clearDraft}
                                        className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        削除
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                下書きはありません。作成中に「下書き保存」ボタンで保存できます。
                            </p>
                        )}
                    </div>
                </div>

                {/* ヒントセクション */}
                <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 md:p-6">
                    <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-2">
                        💡 イベント作成のヒント
                    </h3>
                    <ul className="text-xs text-purple-700 dark:text-purple-400 space-y-1">
                        <li>• タイトルは具体的に、参加者が興味を持つような内容で</li>
                        <li>• 対応言語を明確にすると、参加者が見つけやすくなります</li>
                        <li>• 画像を追加すると、イベントの魅力が伝わりやすくなります</li>
                        <li>• 「履歴から作成」で過去のイベントをテンプレートとして再利用できます</li>
                    </ul>
                </div>
            </div>

            <HistoryModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                title="履歴から作成"
                historyLoading={historyLoading}
                historyError={historyError}
                historyEvents={historyEvents}
                onRefresh={fetchHistory}
                onSelectEvent={onSelectTemplate}
                mode="template"
                canEditEvent={canEditEvent}
                computeStatus={computeStatus}
                isOwnEvent={isOwnEvent}
            />

            <HistoryModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="未完了イベントを編集"
                historyLoading={historyLoading}
                historyError={historyError}
                historyEvents={historyEvents}
                onRefresh={fetchHistory}
                onSelectEvent={onSelectEdit}
                mode="edit"
                canEditEvent={canEditEvent}
                computeStatus={computeStatus}
                isOwnEvent={isOwnEvent}
            />
        </div>
    );
}