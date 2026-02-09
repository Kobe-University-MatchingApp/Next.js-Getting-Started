'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EventFormData } from '@/types/event';
import { createClient } from '@/utils/supabase/client';
import { logger } from '@/lib/utils/logger';
import { EVENT_CATEGORIES, AVAILABLE_LANGUAGES } from '@/lib/constants';
import Link from 'next/link';

const supabase = createClient();
const categories = EVENT_CATEGORIES;
const availableLanguages = AVAILABLE_LANGUAGES;

// SVGアイコン
const SaveIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

const PartyIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;

    const [currentUser, setCurrentUser] = useState<{
        id: string;
        shortId: string | null;
        name: string | null;
    } | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [organizerId, setOrganizerId] = useState<string | null>(null);
    const [participantCount, setParticipantCount] = useState(0);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState<EventFormData>({
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
    });
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState('');
    const [time, setTime] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [customCategory, setCustomCategory] = useState('');
    const [useCustomCategory, setUseCustomCategory] = useState(false);

    // 参加者が自分のみかどうか（削除可能かどうか）
    const canDelete = participantCount <= 1;
    // 他の参加者がいないかどうか（全編集可能かどうか）
    const canFullEdit = participantCount <= 1;

    // ユーザー認証
    useEffect(() => {
        const fetchUser = async () => {
            setAuthLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('short_id, name')
                        .eq('id', user.id)
                        .single();

                    setCurrentUser({
                        id: user.id,
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

    // イベントデータの読み込み
    useEffect(() => {
        if (!eventId) return;

        const fetchEvent = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', eventId)
                    .single();

                if (error || !data) {
                    setNotFound(true);
                    return;
                }

                setOrganizerId(data.organizer_id);

                // カテゴリが既存のものかカスタムかを判定
                const isCustomCategory = !categories.includes(data.category);
                if (isCustomCategory) {
                    setUseCustomCategory(true);
                    setCustomCategory(data.category || '');
                }

                // data.dateから日付と時間を分離
                const dateStr = data.date || '';
                const dateOnly = dateStr.split(' ')[0] || dateStr.split('T')[0] || '';
                const timeOnly = dateStr.includes(' ')
                    ? dateStr.split(' ')[1]?.substring(0, 5)
                    : dateStr.includes('T')
                        ? dateStr.split('T')[1]?.substring(0, 5)
                        : '';

                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    category: isCustomCategory ? '言語交換' : (data.category || '言語交換'),
                    date: dateOnly,
                    dayOfWeek: data.dayofweek || 'mon',
                    period: data.period || 1,
                    location: data.location || '',
                    minParticipants: data.minparticipants ?? 2,
                    maxParticipants: data.maxparticipants || 10,
                    fee: data.fee ?? 0,
                    languages: data.languages || [],
                    tags: data.tags || [],
                    inoutdoor: data.inoutdoor || 'in',
                });
                setSelectedLanguages(data.languages || []);
                setImages(data.images || []);
                setTime(timeOnly);

                // 参加者数を取得
                const { count } = await supabase
                    .from('event_participants')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_id', eventId)
                    .eq('status', 'registered');

                setParticipantCount(count ?? 0);
            } catch (err) {
                logger.error('Event fetch error:', err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: ['maxParticipants', 'minParticipants', 'fee', 'period'].includes(name)
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

    const addImage = () => {
        const url = imageInput.trim();
        if (url && !images.includes(url)) {
            setImages((prev) => [...prev, url]);
            setImageInput('');
        }
    };

    const removeImage = (url: string) => {
        setImages((prev) => prev.filter((img) => img !== url));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            alert('ログインしてください');
            return;
        }

        // カテゴリを決定
        const finalCategory = useCustomCategory && customCategory.trim()
            ? customCategory.trim()
            : formData.category;

        // 日付と時間を結合
        const combinedDateTime = time
            ? `${formData.date} ${time}:00`
            : formData.date;

        // 参加者がいる場合は時間関連のみ更新可能
        const payload = canFullEdit
            ? {
                title: formData.title,
                description: formData.description,
                category: finalCategory,
                date: combinedDateTime,
                dayofweek: formData.dayOfWeek,
                period: formData.period,
                location: formData.location,
                minparticipants: formData.minParticipants ?? null,
                maxparticipants: formData.maxParticipants,
                fee: formData.fee ?? 0,
                languages: selectedLanguages,
                tags: formData.tags ?? [],
                images,
                inoutdoor: formData.inoutdoor ?? null,
            }
            : {
                // 参加者がいる場合は日時のみ編集可能
                date: combinedDateTime,
                dayofweek: formData.dayOfWeek,
                period: formData.period,
            };

        const { error } = await supabase
            .from('events')
            .update(payload)
            .eq('id', eventId);

        if (error) {
            alert(`更新に失敗しました: ${error.message}`);
            return;
        }

        setSuccessMessage('イベントが更新されました！');
        setTimeout(() => {
            router.push(`/find/${eventId}`);
        }, 1500);
    };

    const handleDelete = async () => {
        if (!canDelete) {
            alert('参加者がいるため削除できません');
            return;
        }

        setDeleting(true);
        try {
            // まず参加者レコードを削除
            await supabase
                .from('event_participants')
                .delete()
                .eq('event_id', eventId);

            // イベントを削除
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId);

            if (error) {
                alert(`削除に失敗しました: ${error.message}`);
                return;
            }

            setSuccessMessage('イベントが削除されました');
            setTimeout(() => {
                router.push('/create');
            }, 1500);
        } catch (err) {
            logger.error('Delete error:', err);
            alert('削除中にエラーが発生しました');
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center animate-slide-in-right">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-slide-in-right">
                <div className="text-6xl mb-4">😢</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">イベントが見つかりません</h2>
                <p className="text-sm text-gray-600 mb-6">削除されたか、URLが間違っています</p>
                <Link
                    href="/create"
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors"
                >
                    作成ページに戻る
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 animate-slide-in-right">
            {/* 成功メッセージ */}
            {successMessage && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg animate-pulse">
                    {successMessage}
                </div>
            )}

            {/* 削除確認モーダル */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">イベントを削除しますか？</h3>
                        <p className="text-sm text-gray-600 mb-4">この操作は取り消せません。</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                                disabled={deleting}
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <TrashIcon /> 削除
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ヘッダー */}
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/create" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800">
                            ✏️ イベント編集
                        </h1>
                    </div>
                    {canDelete && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="イベントを削除"
                        >
                            <TrashIcon />
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* ログイン中ユーザー情報 */}
                {currentUser && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2">
                            <CheckIcon />
                            <div>
                                <p className="text-sm font-medium text-green-800">
                                    ログイン中: {currentUser.name || '名前未設定'}
                                </p>
                                <p className="text-[10px] text-green-600">
                                    イベントID: {eventId}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 編集制限の警告 */}
                {!canFullEdit && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start gap-2">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <p className="text-sm font-medium text-amber-800">
                                    参加者がいるため、編集が制限されています
                                </p>
                                <p className="text-xs text-amber-600 mt-1">
                                    現在{participantCount}名が参加登録済みです。日時のみ変更可能です。
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* フォーム */}
                <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 左カラム */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    タイトル <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="例: 日本語&英語で話そう！"
                                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm ${!canFullEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    required
                                    disabled={!canFullEdit}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    カテゴリー <span className="text-red-500">*</span>
                                </label>
                                <div className={`grid grid-cols-3 gap-2 ${!canFullEdit ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => {
                                                setFormData((prev) => ({ ...prev, category }));
                                                setUseCustomCategory(false);
                                            }}
                                            disabled={!canFullEdit}
                                            className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${!useCustomCategory && formData.category === category
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                                {/* カスタムカテゴリ入力 */}
                                {canFullEdit && (
                                    <div className="mt-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <input
                                                type="checkbox"
                                                id="useCustomCategory"
                                                checked={useCustomCategory}
                                                onChange={(e) => setUseCustomCategory(e.target.checked)}
                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                            />
                                            <label htmlFor="useCustomCategory" className="text-xs text-gray-600">
                                                カスタムカテゴリを使用
                                            </label>
                                        </div>
                                        {useCustomCategory && (
                                            <input
                                                type="text"
                                                value={customCategory}
                                                onChange={(e) => setCustomCategory(e.target.value)}
                                                placeholder="例: ボードゲーム"
                                                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm bg-purple-50"
                                                maxLength={20}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    開催日時 <span className="text-red-500">*</span>
                                    {!canFullEdit && <span className="text-purple-600 ml-2">（変更可能）</span>}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                        required
                                    />
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    場所 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="例: 渋谷カフェ"
                                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm ${!canFullEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    required
                                    disabled={!canFullEdit}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    屋内 / 屋外 <span className="text-red-500">*</span>
                                </label>
                                <div className={`grid grid-cols-2 gap-2 ${!canFullEdit ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <button
                                        type="button"
                                        onClick={() => setInOutDoor('in')}
                                        disabled={!canFullEdit}
                                        className={`py-2.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${(formData.inoutdoor ?? 'in') === 'in'
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        🏠 Indoor
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInOutDoor('out')}
                                        disabled={!canFullEdit}
                                        className={`py-2.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${formData.inoutdoor === 'out'
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        🌳 Outdoor
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    参加人数 <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-medium text-gray-500 mb-1">最小</label>
                                        <input
                                            type="number"
                                            name="minParticipants"
                                            value={formData.minParticipants}
                                            onChange={handleInputChange}
                                            min={2}
                                            max={100}
                                            className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm ${!canFullEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            disabled={!canFullEdit}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-gray-500 mb-1">最大</label>
                                        <input
                                            type="number"
                                            name="maxParticipants"
                                            value={formData.maxParticipants}
                                            onChange={handleInputChange}
                                            min={2}
                                            max={100}
                                            className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm ${!canFullEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            required
                                            disabled={!canFullEdit}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">参加費（円）</label>
                                <input
                                    type="number"
                                    name="fee"
                                    value={formData.fee}
                                    onChange={handleInputChange}
                                    min={0}
                                    placeholder="0"
                                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm ${!canFullEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={!canFullEdit}
                                />
                            </div>
                        </div>

                        {/* 右カラム */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    対応言語 <span className="text-red-500">*</span>
                                </label>
                                <div className={`flex flex-wrap gap-1.5 ${!canFullEdit ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {availableLanguages.map((language) => (
                                        <button
                                            key={language}
                                            type="button"
                                            onClick={() => toggleLanguage(language)}
                                            disabled={!canFullEdit}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedLanguages.includes(language)
                                                ? 'bg-blue-500 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {language}
                                        </button>
                                    ))}
                                </div>
                                {selectedLanguages.length === 0 && (
                                    <p className="text-[10px] text-red-500 mt-1">※ 1つ以上選択してください</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    詳細 <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="イベントの内容を記入"
                                    rows={5}
                                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm ${!canFullEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    required
                                    disabled={!canFullEdit}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    画像URL（任意・複数可）
                                </label>
                                <div className={`flex gap-1.5 mb-2 ${!canFullEdit ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <input
                                        type="url"
                                        value={imageInput}
                                        onChange={(e) => setImageInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                                        placeholder="https://example.com/image.jpg"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                        disabled={!canFullEdit}
                                    />
                                    <button
                                        type="button"
                                        onClick={addImage}
                                        disabled={!canFullEdit}
                                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium transition-colors"
                                    >
                                        追加
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {images.map((url) => (
                                        <span
                                            key={url}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-[10px] flex items-center gap-1 max-w-full"
                                        >
                                            <span className="truncate max-w-[140px]">{url}</span>
                                            {canFullEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(url)}
                                                    className="text-gray-500 hover:text-red-500 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">タグ</label>
                                <div className={`flex gap-1.5 mb-2 ${!canFullEdit ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="タグを入力"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                        disabled={!canFullEdit}
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        disabled={!canFullEdit}
                                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium transition-colors"
                                    >
                                        追加
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {formData.tags?.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium flex items-center gap-1"
                                        >
                                            {tag}
                                            {canFullEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="text-purple-500 hover:text-red-500 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 送信ボタン */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={canFullEdit && selectedLanguages.length === 0}
                            className="w-full px-3 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-1.5"
                        >
                            <PartyIcon /> {canFullEdit ? 'イベントを更新' : '日時を更新'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
