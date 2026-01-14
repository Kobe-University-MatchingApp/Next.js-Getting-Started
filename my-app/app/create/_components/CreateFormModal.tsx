import React from 'react';
import { EventCategory, EventFormData } from '@/types/event';
import { EVENT_CATEGORIES, AVAILABLE_LANGUAGES } from '@/lib/constants';

const categories: EventCategory[] = EVENT_CATEGORIES;
const availableLanguages = AVAILABLE_LANGUAGES;

// 多くはデバッグ用のpropsなので，必要に応じて整理してください
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
    imageInput: string;
    setImageInput: React.Dispatch<React.SetStateAction<string>>;
    addImage: () => void;
    removeImage: (url: string) => void;
    time: string;
    setTime: React.Dispatch<React.SetStateAction<string>>;
    onSubmit: (e: React.FormEvent) => void;
    isEditMode: boolean;
    resetToCreateMode?: () => void;
    debugOpen: boolean;
    setDebugOpen: React.Dispatch<React.SetStateAction<boolean>>;
    lastDebug: any;
    pageMode: string;
    isTemplateModalOpen: boolean;
    isEditModalOpen: boolean;
    historyLoading: boolean;
    historyError: string | null;
    historyEvents: any[];
    editingId: string | null;
    fetchHistory: () => Promise<void>;
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
    imageInput,
    setImageInput,
    addImage,
    removeImage,
    time,
    setTime,
    onSubmit,
    isEditMode,
    resetToCreateMode,
    debugOpen,
    setDebugOpen,
    lastDebug,
    pageMode,
    isTemplateModalOpen,
    isEditModalOpen,
    historyLoading,
    historyError,
    historyEvents,
    editingId,
    fetchHistory,
}: CreateFormModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white w-full rounded-t-2xl max-h-[95vh] overflow-y-auto">
                {/* ヘッダー */}
                <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-bold text-gray-800">
                            {isEditMode ? 'イベント編集' : 'イベント作成'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setDebugOpen((v) => !v)}
                            className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-medium"
                        >
                            Debug
                        </button>
                        {isEditMode && resetToCreateMode && (
                            <button
                                type="button"
                                onClick={resetToCreateMode}
                                className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-medium"
                            >
                                編集キャンセル
                            </button>
                        )}
                    </div>
                </div>

                {/* デバッグパネル */}
                {debugOpen && (
                    <div className="bg-black text-green-200 p-3 mx-4 mt-4 rounded-lg text-[10px] overflow-x-auto">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-bold">Debug Panel</p>
                            <button
                                type="button"
                                className="px-2 py-1 bg-green-700 text-white rounded"
                                onClick={fetchHistory}
                            >
                                fetchHistory()
                            </button>
                        </div>
                        <pre className="whitespace-pre-wrap break-words">{JSON.stringify({
                            pageMode,
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

                {/* フォーム */}
                <form onSubmit={onSubmit} className="p-4 space-y-4">
                    {/* タイトル */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            タイトル <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={onInputChange}
                            placeholder="例: 日本語&英語で話そう！"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                            required
                        />
                    </div>

                    {/* カテゴリー */}
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
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 開催日時 */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            開催日時 <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={onInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                required
                            />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* 場所 */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            場所 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={onInputChange}
                            placeholder="例: 渋谷カフェ"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                            required
                        />
                    </div>

                    {/* 屋内/屋外 */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            屋内 / 屋外 <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setInOutDoor('in')}
                                className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${(formData.inoutdoor ?? 'in') === 'in'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                    : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                Indoor
                            </button>
                            <button
                                type="button"
                                onClick={() => setInOutDoor('out')}
                                className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${formData.inoutdoor === 'out'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                    : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                Outdoor
                            </button>
                        </div>
                    </div>

                    {/* 参加人数 */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            参加人数 <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    最小
                                </label>
                                <input
                                    type="number"
                                    name="minParticipants"
                                    value={formData.minParticipants}
                                    onChange={onInputChange}
                                    min={2}
                                    max={100}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    最大
                                </label>
                                <input
                                    type="number"
                                    name="maxParticipants"
                                    value={formData.maxParticipants}
                                    onChange={onInputChange}
                                    min={2}
                                    max={100}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* 参加費 */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            参加費（円）
                        </label>
                        <input
                            type="number"
                            name="fee"
                            value={formData.fee}
                            onChange={onInputChange}
                            min={0}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                        />
                    </div>

                    {/* 対応言語 */}
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
                                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${selectedLanguages.includes(language)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {language}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 詳細 */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            詳細 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onInputChange}
                            placeholder="イベントの内容を記入"
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm"
                            required
                        />
                    </div>

                    {/* 画像URL */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            画像URL（任意・複数可）
                        </label>
                        <div className="flex gap-1.5 mb-2">
                            <input
                                type="url"
                                value={imageInput}
                                onChange={(e) => setImageInput(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && (e.preventDefault(), addImage())
                                }
                                placeholder="https://example.com/image.jpg"
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                            />
                            <button
                                type="button"
                                onClick={addImage}
                                className="px-4 py-1.5 bg-purple-500 text-white rounded-lg text-xs font-medium"
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
                                    <button
                                        type="button"
                                        onClick={() => removeImage(url)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* タグ */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            タグ
                        </label>
                        <div className="flex gap-1.5 mb-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && (e.preventDefault(), addTag())
                                }
                                placeholder="タグを入力"
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-1.5 bg-purple-500 text-white rounded-lg text-xs font-medium"
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
                                        className="text-purple-500 hover:text-purple-700"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 送信ボタン */}
                    <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 z-10">
                        <button
                            type="submit"
                            disabled={selectedLanguages.length === 0}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold text-sm disabled:opacity-50"
                        >
                            {isEditMode ? 'イベントを更新' : 'イベントを作成'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
