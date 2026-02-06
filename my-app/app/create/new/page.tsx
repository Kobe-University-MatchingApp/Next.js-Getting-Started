'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EventFormData } from '@/types/event';
import { createClient } from '@/utils/supabase/client';
import { logger } from '@/lib/utils/logger';
import { EVENT_CATEGORIES, AVAILABLE_LANGUAGES } from '@/lib/constants';
import Link from 'next/link';

const supabase = createClient();
const categories = EVENT_CATEGORIES;
const availableLanguages = AVAILABLE_LANGUAGES;

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

const DRAFT_KEY = 'event_draft';

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

const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function CreateNewEventPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentUser, setCurrentUser] = useState<{
        id: string;
        shortId: string | null;
        name: string | null;
    } | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [formData, setFormData] = useState<EventFormData>(emptyForm);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [time, setTime] = useState('');
    const [guestName, setGuestName] = useState('');
    const [showGuestConfirm, setShowGuestConfirm] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    // テンプレートまたは編集データの読み込み
    useEffect(() => {
        const templateData = searchParams.get('data');
        if (templateData) {
            try {
                const parsed = JSON.parse(decodeURIComponent(templateData));
                setFormData(parsed.formData || emptyForm);
                setSelectedLanguages(parsed.languages || []);
                setImages(parsed.images || []);
                setTime(parsed.time || '');
            } catch (e) {
                logger.error('Template parse error:', e);
            }
        }
    }, [searchParams]);

    // 下書き読み込み
    useEffect(() => {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft && !searchParams.get('data')) {
            try {
                const parsed = JSON.parse(draft);
                setFormData(parsed.formData || emptyForm);
                setSelectedLanguages(parsed.selectedLanguages || []);
                setImages(parsed.images || []);
                setTime(parsed.time || '');
                setGuestName(parsed.guestName || '');
            } catch (e) {
                logger.error('Draft parse error:', e);
            }
        }
    }, [searchParams]);

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setImages((prev) => [...prev, dataUrl]);
            };
            reader.readAsDataURL(file);
        });

        // ファイルインプットをリセット
        e.target.value = '';
    };

    const removeImage = (url: string) => {
        setImages((prev) => prev.filter((img) => img !== url));
    };

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
        setSuccessMessage('下書きを保存しました');
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const executeSubmit = async () => {
        const isGuest = !currentUser;
        const organizerId = isGuest
            ? `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            : currentUser.id;
        const organizerName = isGuest
            ? guestName.trim() || '匿名ゲスト'
            : currentUser.name || '名前未設定';

        // ログインユーザーの場合、プロフィール画像を取得
        let organizerAvatar: string | null = null;
        if (!isGuest && currentUser) {
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('images')
                    .eq('id', currentUser.id)
                    .single();
                
                if (profile?.images && Array.isArray(profile.images) && profile.images.length > 0) {
                    organizerAvatar = profile.images[0];
                }
            } catch (err) {
                logger.error('Error fetching profile image:', err);
                // エラーが発生してもイベント作成は続行
            }
        }

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
            organizer_avatar: organizerAvatar,
            tags: formData.tags ?? [],
            images,
            inoutdoor: formData.inoutdoor ?? null,
        };

        const { error } = await supabase.from('events').insert(payload as any);
        if (error) {
            alert(`保存に失敗しました: ${error.message}`);
            return;
        }

        localStorage.removeItem(DRAFT_KEY);
        setSuccessMessage('イベントが作成されました！');
        setTimeout(() => {
            router.push('/find');
        }, 1500);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            setShowGuestConfirm(true);
            return;
        }
        await executeSubmit();
    };

    const confirmGuestSubmit = async () => {
        setShowGuestConfirm(false);
        await executeSubmit();
    };

    const isGuest = !currentUser;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 animate-slide-in-right">
            {/* 成功メッセージ */}
            {successMessage && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg animate-pulse">
                    {successMessage}
                </div>
            )}

            {/* ゲスト確認ポップアップ */}
            {showGuestConfirm && (
                <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="text-center mb-4">
                            <span className="text-4xl">👤</span>
                            <h3 className="text-lg font-bold text-gray-800 mt-2">
                                ゲストとして投稿しますか？
                            </h3>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-amber-800">⚠️ ゲスト投稿の場合：</p>
                            <ul className="text-xs text-amber-700 mt-1 space-y-1">
                                <li>• 後からイベントを編集できません</li>
                                <li>• 履歴から再利用できません</li>
                                <li>• 主催者として認証されません</li>
                            </ul>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                            表示される主催者名: <strong>{guestName.trim() || '匿名ゲスト'}</strong>
                        </p>
                        <div className="flex gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => setShowGuestConfirm(false)}
                                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
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

            {/* ヘッダー */}
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <Link href="/create" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800">
                        ✨ イベント作成
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* ゲストモード警告 */}
                {isGuest && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-200 rounded-full">
                                <UserIcon />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-amber-800 mb-1">
                                    ゲストモードで作成中
                                </p>
                                <p className="text-xs text-amber-700 mb-3">
                                    ログインすると、後から編集や履歴機能が使えます
                                </p>
                                <label className="block text-xs font-medium text-amber-800 mb-1">
                                    主催者名（表示名）
                                </label>
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="例: Tanaka"
                                    className="w-full px-3 py-2 border border-amber-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                    maxLength={30}
                                />
                                <p className="text-[10px] text-amber-600 mt-1">
                                    ※ 空欄の場合は「匿名ゲスト」として表示されます
                                </p>
                            </div>
                        </div>
                    </div>
                )}

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
                                    このイベントはあなたのアカウントに紐づけられます
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
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    カテゴリー <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, category }))}
                                            className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${formData.category === category
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    開催日時 <span className="text-red-500">*</span>
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
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    屋内 / 屋外 <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setInOutDoor('in')}
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
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
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
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                            required
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
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                />
                            </div>
                        </div>

                        {/* 右カラム */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    対応言語 <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableLanguages.map((language) => (
                                        <button
                                            key={language}
                                            type="button"
                                            onClick={() => toggleLanguage(language)}
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
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    画像（任意・複数可）
                                </label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                                        />
                                    </div>
                                    {images.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {images.map((url, index) => (
                                                <div
                                                    key={index}
                                                    className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                                                >
                                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(url)}
                                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">タグ</label>
                                <div className="flex gap-1.5 mb-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="タグを入力"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
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
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="text-purple-500 hover:text-red-500 transition-colors"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 送信ボタン */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex flex-col gap-2 w-full">
                            <button
                                type="submit"
                                disabled={selectedLanguages.length === 0}
                                className="w-full px-3 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-1.5"
                            >
                                <PartyIcon /> イベントを作成
                            </button>
                            <button
                                type="button"
                                onClick={saveDraft}
                                className="w-full px-3 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                            >
                                <SaveIcon /> 下書き保存
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
