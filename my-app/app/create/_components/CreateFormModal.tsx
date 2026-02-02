import React from 'react';
import { EventCategory, EventFormData } from '@/types/event';
import { EVENT_CATEGORIES, AVAILABLE_LANGUAGES } from '@/lib/constants';

const categories: EventCategory[] = EVENT_CATEGORIES;
const availableLanguages = AVAILABLE_LANGUAGES;

// SVGアイコンコンポーネント（Safari互換）
const SaveIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

const SparklesIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const UserIconSmall = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PartyIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface CreateFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: EventFormData;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setInOutDoor: (value: 'in' | 'out') => void;
    setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
    selectedLanguages: string[];
    toggleLanguage: (language: string) => void;
    tagInput: string;
    setTagInput: React.Dispatch<React.SetStateAction<string>>;
    addTag: () => void;
    removeTag: (tag: string) => void;
    images: string[];
    setImages: React.Dispatch<React.SetStateAction<string[]>>;
    time: string;
    setTime: React.Dispatch<React.SetStateAction<string>>;
    onSubmit: (e: React.FormEvent) => void;
    isEditMode: boolean;
    resetToCreateMode?: () => void;
    debugOpen: boolean;
    setDebugOpen: React.Dispatch<React.SetStateAction<boolean>>;
    lastDebug: any;
    isTemplateModalOpen: boolean;
    isEditModalOpen: boolean;
    historyLoading: boolean;
    historyError: string | null;
    historyEvents: any[];
    editingId: string | null;
    fetchHistory: () => Promise<void>;
    saveDraft?: () => void;
    currentUser?: { id: string; shortId: string | null; name: string | null } | null;
    guestName?: string;
    setGuestName?: React.Dispatch<React.SetStateAction<string>>;
}

export default function CreateFormModal({
    isOpen,
    onClose,
    formData,
    onInputChange,
    setInOutDoor,
    setFormData,
    selectedLanguages,
    toggleLanguage,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    images,
    setImages,
    time,
    setTime,
    onSubmit,
    isEditMode,
    resetToCreateMode,
    debugOpen,
    setDebugOpen,
    lastDebug,
    isTemplateModalOpen,
    isEditModalOpen,
    historyLoading,
    historyError,
    historyEvents,
    editingId,
    fetchHistory,
    saveDraft,
    currentUser,
    guestName = '',
    setGuestName,
}: CreateFormModalProps) {
    if (!isOpen) return null;

    // 画像選択時のハンドラ
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                setImages(prev => {
                    if (prev.includes(imageUrl)) return prev;
                    return [...prev, imageUrl];
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
            <div className="bg-white dark:bg-gray-900 w-full md:w-[90%] md:max-w-3xl md:rounded-2xl rounded-t-2xl max-h-[95vh] md:max-h-[90vh] shadow-2xl flex flex-col">
                {/* ヘッダー */}
                <div className="flex-shrink-0 bg-white dark:bg-gray-900 rounded-t-2xl border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                            {isEditMode ? (
                                <><EditIcon /> イベント編集</>
                            ) : (
                                <><SparklesIcon /> イベント作成</>
                            )}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setDebugOpen((v) => !v)}
                            className="px-2 py-1 bg-gray-600 text-white rounded text-[10px] font-medium"
                        >
                            Debug
                        </button>
                        {isEditMode && resetToCreateMode && (
                            <button
                                type="button"
                                onClick={resetToCreateMode}
                                className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                                キャンセル
                            </button>
                        )}
                    </div>
                </div>

                {/* スクロール可能なコンテンツエリア */}
                <div className="flex-1 overflow-y-auto">
                    {/* デバッグパネル */}
                    {debugOpen && (
                        <div className="bg-gray-900 text-green-400 p-3 mx-4 mt-4 rounded-lg text-[10px] overflow-x-auto font-mono">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-bold text-green-300">🔧 Debug Panel</p>
                                <button
                                    type="button"
                                    className="px-2 py-1 bg-green-700 text-white rounded text-[10px]"
                                    onClick={fetchHistory}
                                >
                                    fetchHistory()
                                </button>
                            </div>
                            <pre className="whitespace-pre-wrap break-words">{JSON.stringify({
                                currentUser: currentUser ? { id: currentUser.id.slice(0, 8) + '...', shortId: currentUser.shortId, name: currentUser.name } : null,
                                guestName,
                                isTemplateModalOpen,
                                isEditModalOpen,
                                historyLoading,
                                historyError,
                                historyCount: historyEvents.length,
                                isEditMode,
                                editingId,
                                lastDebug,
                            }, null, 2)}</pre>
                        </div>
                    )}

                    {/* ゲストモード警告 + 臨時ユーザー名入力 */}
                    {isGuest && (
                        <div className="mx-4 mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-200 dark:bg-amber-800 rounded-full">
                                    <UserIcon />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">
                                        ゲストモードで作成中
                                    </p>
                                    <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                                        ログインすると、後から編集や履歴機能が使えます
                                    </p>
                                    <label className="block text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">
                                        主催者名（表示名）
                                    </label>
                                    <input
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName?.(e.target.value)}
                                        placeholder="例: Tanaka"
                                        className="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                        maxLength={30}
                                    />
                                    <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1">
                                        ※ 空欄の場合は「匿名ゲスト」として表示されます
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ログイン中ユーザー情報 */}
                    {currentUser && (
                        <div className="mx-4 mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl">
                            <div className="flex items-center gap-2">
                                <CheckIcon />
                                <div>
                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                        ログイン中: {currentUser.name || '名前未設定'}
                                    </p>
                                    <p className="text-[10px] text-green-600 dark:text-green-400">
                                        このイベントはあなたのアカウントに紐づけられます
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* フォーム */}
                    <form id="create-event-form" onSubmit={onSubmit} className="p-4 md:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* 左カラム */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                        タイトル <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={onInputChange}
                                        placeholder="例: 日本語&英語で話そう！"
                                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
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
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                        開催日時 <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="date" name="date" value={formData.date} onChange={onInputChange} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" required />
                                        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                        場所 <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="location" value={formData.location} onChange={onInputChange} placeholder="例: 渋谷カフェ" className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" required />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                        屋内 / 屋外 <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button type="button" onClick={() => setInOutDoor('in')} className={`py-2.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${(formData.inoutdoor ?? 'in') === 'in' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>🏠 Indoor</button>
                                        <button type="button" onClick={() => setInOutDoor('out')} className={`py-2.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${formData.inoutdoor === 'out' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>🌳 Outdoor</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                        参加人数 <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">最小</label>
                                            <input type="number" name="minParticipants" value={formData.minParticipants} onChange={onInputChange} min={2} max={100} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">最大</label>
                                            <input type="number" name="maxParticipants" value={formData.maxParticipants} onChange={onInputChange} min={2} max={100} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" required />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">参加費（円）</label>
                                    <input type="number" name="fee" value={formData.fee} onChange={onInputChange} min={0} placeholder="0" className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
                                </div>
                            </div>

                            {/* 右カラム */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                        対応言語 <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {availableLanguages.map((language) => (
                                            <button key={language} type="button" onClick={() => toggleLanguage(language)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedLanguages.includes(language) ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{language}</button>
                                        ))}
                                    </div>
                                    {selectedLanguages.length === 0 && <p className="text-[10px] text-red-500 mt-1">※ 1つ以上選択してください</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                        詳細 <span className="text-red-500">*</span>
                                    </label>
                                    <textarea name="description" value={formData.description} onChange={onInputChange} placeholder="イベントの内容を記入" rows={5} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm" required />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">画像URL（任意・複数可）</label>
                                    <div className="flex gap-1.5 mb-2">
                                        <input type="url" value={imageInput} onChange={(e) => setImageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())} placeholder="https://example.com/image.jpg" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
                                        <button type="button" onClick={addImage} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium transition-colors">追加</button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {images.map((url) => (
                                            <span key={url} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-[10px] flex items-center gap-1 max-w-full">
                                                <span className="truncate max-w-[140px]">{url}</span>
                                                <button type="button" onClick={() => removeImage(url)} className="text-gray-500 hover:text-red-500 transition-colors">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                    {/* 画像 */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            イベント画像（任意・複数可）
                        </label>
                        
                        {/* ファイルアップロード */}
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-3"
                        />

                        {/* 選択された画像 */}
                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {images.map((url, idx) => (
                                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                                        <img src={url} alt={`event-${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-bl px-1 py-0.5 hover:bg-red-600 text-xs font-bold"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                {/* 送信ボタンエリア - 固定 */}
                <div className="flex-shrink-0 bg-white dark:bg-gray-900 p-4 pb-6 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
                    <div className="flex flex-row gap-3">
                        {saveDraft && (
                            <button type="button" onClick={saveDraft} className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2">
                                <SaveIcon /> 下書き保存
                            </button>
                        )}
                        <button type="submit" form="create-event-form" disabled={selectedLanguages.length === 0} className={`${saveDraft ? 'flex-[2]' : 'flex-1 w-full'} px-4 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2`}>
                            {isEditMode ? (
                                <><EditIcon /> イベントを更新</>
                            ) : isGuest ? (
                                <><UserIconSmall /> ゲストとして作成</>
                            ) : (
                                <><PartyIcon /> イベントを作成</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
