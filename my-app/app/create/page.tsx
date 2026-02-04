'use client';

import { useCallback, useEffect, useState } from 'react';
import { EventFormData } from '@/types/event';
import CreateFormModal from './_components/CreateFormModal';
import HistoryModal from './_components/HistoryModal';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const emptyForm: EventFormData = {
    title: '',
    description: '',
    category: '言語交換',
    date: '',
    dayOfWeek: 'mon',
    period: 1,
    location: '',
    minParticipants: 2,
    maxParticipants: 10,
    fee: 0,
    languages: [],
    tags: [],
    inoutdoor: 'in',
};

// ローカルストレージキー
const DRAFT_KEY = 'event_draft';

export default function CreateEventPage() {
    // ユーザー認証状態 - UUID, shortId, name, avatar を取得
    const [currentUser, setCurrentUser] = useState<{ 
        id: string; 
        shortId: string | null; 
        name: string | null;
        avatar: string | null;
    } | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [formData, setFormData] = useState<EventFormData>(emptyForm);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    const [images, setImages] = useState<string[]>([]);

    const [time, setTime] = useState('');

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // History state
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [historyEvents, setHistoryEvents] = useState<any[]>([]);

    // 下書き状態
    const [hasDraft, setHasDraft] = useState(false);

    // ゲスト用臨時ユーザー名
    const [guestName, setGuestName] = useState('');
    
    // ゲスト確認ポップアップ
    const [showGuestConfirm, setShowGuestConfirm] = useState(false);
    const [pendingSubmitEvent, setPendingSubmitEvent] = useState<React.FormEvent | null>(null);

    // debug panel
    const [debugOpen, setDebugOpen] = useState(false);
    const [lastDebug, setLastDebug] = useState<any>(null);

    // 成功メッセージ
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // ユーザー認証とprofile情報取得
    useEffect(() => {
        const fetchUser = async () => {
            setAuthLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // profilesテーブルからshort_id, name, imagesを取得
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('short_id, name, images')
                        .eq('id', user.id)
                        .single();
                    
                    // 画像配列から最初の画像を取得
                    let avatarUrl: string | null = null;
                    if (profile?.images && Array.isArray(profile.images) && profile.images.length > 0) {
                        avatarUrl = profile.images[0];
                    }
                    
                    setCurrentUser({
                        id: user.id,  // UUID
                        shortId: profile?.short_id ?? null,
                        name: profile?.name ?? null,
                        avatar: avatarUrl,
                    });
                } else {
                    setCurrentUser(null);
                }
            } catch (err) {
                console.error('Auth error:', err);
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

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === 'maxParticipants' ||
                name === 'minParticipants' ||
                name === 'fee' ||
                name === 'period'
                    ? Number(value)
                    : value,
        }));
    };

    const setInOutDoor = (value: 'in' | 'out') => {
        setFormData((prev) => ({ ...prev, inoutdoor: value }));
    };

    const toggleLanguage = (language: string) => {
        setSelectedLanguages((prev) =>
            prev.includes(language)
                ? prev.filter((l) => l !== language)
                : [...prev, language]
        );
    };

    const addTag = () => {
        const next = tagInput.trim();
        if (next && !formData.tags?.includes(next)) {
            setFormData((prev) => ({
                ...prev,
                tags: [...(prev.tags || []), next],
            }));
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags?.filter((t) => t !== tag),
        }));
    };

    // 下書き保存
    const saveDraft = () => {
        const draft = {
            formData,
            selectedLanguages,
            images,
            time,
            guestName,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setHasDraft(true);
        setSuccessMessage('下書きを保存しました');
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    // 下書き読み込み
    const loadDraft = () => {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
            try {
                const draft = JSON.parse(raw);
                setFormData(draft.formData || emptyForm);
                setSelectedLanguages(draft.selectedLanguages || []);
                setImages(draft.images || []);
                setTime(draft.time || '');
                setGuestName(draft.guestName || '');
                setIsCreateModalOpen(true);
            } catch (e) {
                console.error('Draft parse error:', e);
            }
        }
    };

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

    const resetToCreateMode = () => {
        setEditingId(null);
        setIsEditMode(false);
        setFormData(emptyForm);
        setSelectedLanguages([]);
        setImages([]);
        setTagInput('');
        setTime('');
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
            setLastDebug({ 
                odName: currentUser?.name,
                rows: (data ?? []).length 
            });
        } catch (err: any) {
            setHistoryError(err?.message ?? '履歴の取得に失敗しました');
        } finally {
            setHistoryLoading(false);
        }
    }, [currentUser]);

    const openCreateNew = () => {
        resetToCreateMode();
        setIsCreateModalOpen(true);
    };

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

    const onSelectTemplate = (row: any) => {
        setFormData((prev) => ({
            ...prev,
            title: String(row?.title ?? ''),
            description: String(row?.description ?? ''),
            category: (row?.category ?? '言語交換') as any,
            date: '',
            dayOfWeek: String(row?.dayofweek ?? row?.dayOfWeek ?? prev.dayOfWeek ?? 'mon'),
            period: Number(row?.period ?? prev.period ?? 1),
            location: String(row?.location ?? ''),
            minParticipants: Number(row?.minparticipants ?? row?.minParticipants ?? prev.minParticipants ?? 2),
            maxParticipants: Number(row?.maxparticipants ?? row?.maxParticipants ?? prev.maxParticipants ?? 10),
            fee: typeof row?.fee === 'number' ? row.fee : prev.fee,
            tags: Array.isArray(row?.tags) ? row.tags : prev.tags,
            inoutdoor:
                row?.inoutdoor === 'out'
                    ? 'out'
                    : row?.inoutdoor === 'in'
                        ? 'in'
                        : prev.inoutdoor,
        }));

        setSelectedLanguages(Array.isArray(row?.languages) ? row.languages : []);
        setImages(Array.isArray(row?.images) ? row.images : []);
        setTime('');

        setIsTemplateModalOpen(false);
        setIsEditMode(false);
        setEditingId(null);
        setIsCreateModalOpen(true);
    };

    const onSelectEdit = (row: any) => {
        if (!canEditEvent(row)) return;

        setIsEditMode(true);
        setEditingId(String(row?.id ?? ''));

        setFormData((prev) => ({
            ...prev,
            title: String(row?.title ?? ''),
            description: String(row?.description ?? ''),
            category: (row?.category ?? '言語交換') as any,
            date: String(row?.date ?? ''),
            dayOfWeek: String(row?.dayofweek ?? row?.dayOfWeek ?? prev.dayOfWeek ?? 'mon'),
            period: Number(row?.period ?? prev.period ?? 1),
            location: String(row?.location ?? ''),
            minParticipants: Number(row?.minparticipants ?? row?.minParticipants ?? prev.minParticipants ?? 2),
            maxParticipants: Number(row?.maxparticipants ?? row?.maxParticipants ?? prev.maxParticipants ?? 10),
            fee: typeof row?.fee === 'number' ? row.fee : prev.fee,
            tags: Array.isArray(row?.tags) ? row.tags : prev.tags,
            inoutdoor:
                row?.inoutdoor === 'out'
                    ? 'out'
                    : row?.inoutdoor === 'in'
                        ? 'in'
                        : prev.inoutdoor,
        }));

        setSelectedLanguages(Array.isArray(row?.languages) ? row.languages : []);
        setImages(Array.isArray(row?.images) ? row.images : []);
        setTime(String(row?.time ?? row?.event_time ?? ''));

        setIsEditModalOpen(false);
        setIsCreateModalOpen(true);
    };

    // 実際の送信処理
    const executeSubmit = async () => {
        // ゲストの場合は臨時ID生成
        const isGuest = !currentUser;
        const organizerId = isGuest 
            ? `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            : currentUser.id;  // UUID
        const organizerName = isGuest 
            ? guestName.trim() || '匿名ゲスト'
            : currentUser.name || '名前未設定';

        const payload = {
            id: `evt_${Date.now()}`,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            date: formData.date,
            dayofweek: formData.dayOfWeek,
            period: formData.period,
            location: formData.location,
            minparticipants: formData.minParticipants ?? null,
            maxparticipants: formData.maxParticipants,
            currentparticipants: 0,
            fee: formData.fee ?? 0,
            languages: selectedLanguages,
            organizer_id: organizerId,
            organizer_name: organizerName,
            organizer_avatar: isGuest ? null : (currentUser?.avatar ?? null),
            tags: formData.tags ?? [],
            images,
            inoutdoor: formData.inoutdoor ?? null,
        };

        if (!isEditMode) {
            const { error } = await supabase.from('events').insert(payload as any);
            if (error) {
                alert(`保存に失敗しました: ${error.message}`);
                return;
            }
            clearDraft();
            setSuccessMessage('イベントが作成されました！');
            setIsCreateModalOpen(false);
            resetToCreateMode();
            setTimeout(() => setSuccessMessage(null), 5000);
            return;
        }

        if (!editingId) {
            alert('編集対象が見つかりません');
            return;
        }

        const { id: _drop, ...updatePayload } = payload as any;

        const { error } = await supabase
            .from('events')
            .update(updatePayload)
            .eq('id', editingId);

        if (error) {
            alert(`更新に失敗しました: ${error.message}`);
            return;
        }

        setSuccessMessage('イベントを更新しました！');
        setIsCreateModalOpen(false);
        resetToCreateMode();
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ゲストの場合は確認ポップアップを表示
        if (!currentUser) {
            setPendingSubmitEvent(e);
            setShowGuestConfirm(true);
            return;
        }

        await executeSubmit();
    };

    // ゲスト確認後の送信
    const confirmGuestSubmit = async () => {
        setShowGuestConfirm(false);
        setPendingSubmitEvent(null);
        await executeSubmit();
    };

    const cancelGuestSubmit = () => {
        setShowGuestConfirm(false);
        setPendingSubmitEvent(null);
    };

    return (
        <div className="py-4 md:py-8">
            {/* 成功メッセージ */}
            {successMessage && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg animate-pulse">
                    {successMessage}
                </div>
            )}

            {/* ゲスト確認ポップアップ */}
            {showGuestConfirm && (
                <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="text-center mb-4">
                            <span className="text-4xl">👤</span>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-2">
                                ゲストとして投稿しますか？
                            </h3>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4">
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                ⚠️ ゲスト投稿の場合：
                            </p>
                            <ul className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-1">
                                <li>• 後からイベントを編集できません</li>
                                <li>• 履歴から再利用できません</li>
                                <li>• 主催者として認証されません</li>
                            </ul>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            表示される主催者名: <strong>{guestName.trim() || '匿名ゲスト'}</strong>
                        </p>
                        <div className="flex gap-3 mt-4">
                            <button
                                type="button"
                                onClick={cancelGuestSubmit}
                                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                type="button"
                                onClick={confirmGuestSubmit}
                                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                ゲストで投稿
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        <button
                            type="button"
                            onClick={openCreateNew}
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all md:w-auto w-full"
                        >
                            ✨ 新規作成
                        </button>
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
                                    <button
                                        type="button"
                                        onClick={loadDraft}
                                        className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors"
                                    >
                                        下書きを開く
                                    </button>
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

            <CreateFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                formData={formData}
                onInputChange={handleInputChange}
                setInOutDoor={setInOutDoor}
                setFormData={setFormData}
                selectedLanguages={selectedLanguages}
                toggleLanguage={toggleLanguage}
                tagInput={tagInput}
                setTagInput={setTagInput}
                addTag={addTag}
                removeTag={removeTag}
                images={images}
                setImages={setImages}
                time={time}
                setTime={setTime}
                onSubmit={onSubmit}
                isEditMode={isEditMode}
                resetToCreateMode={resetToCreateMode}
                debugOpen={debugOpen}
                setDebugOpen={setDebugOpen}
                lastDebug={lastDebug}
                isTemplateModalOpen={isTemplateModalOpen}
                isEditModalOpen={isEditModalOpen}
                historyLoading={historyLoading}
                historyError={historyError}
                historyEvents={historyEvents}
                editingId={editingId}
                fetchHistory={fetchHistory}
                saveDraft={saveDraft}
                currentUser={currentUser}
                guestName={guestName}
                setGuestName={setGuestName}
            />

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