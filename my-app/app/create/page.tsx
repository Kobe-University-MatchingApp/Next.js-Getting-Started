'use client';

import { useEffect, useState } from 'react';
import { EventCategory, EventFormData } from '@/types/event';
import { supabase } from '@/lib/supabaseClient';
import { EVENT_CATEGORIES, AVAILABLE_LANGUAGES } from '@/lib/constants';
import HistoryModal from './_components/HistoryModal';

const categories: EventCategory[] = EVENT_CATEGORIES;

const availableLanguages = AVAILABLE_LANGUAGES;

export default function CreateEventPage() {
    const [pageMode, setPageMode] = useState<'top' | 'form'>('top');
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [historyEvents, setHistoryEvents] = useState<any[]>([]);

    const [editingId, setEditingId] = useState<string | null>(null);

    const [debugOpen, setDebugOpen] = useState(false);
    const [lastDebug, setLastDebug] = useState<any>(null);

    const loadEventAsTemplate = (row: any) => {
        try {
            const dateText: string = String(row?.date ?? '');
            const [dPart, tPart] = dateText.split(' ');

            // IMPORTANT: template mode must NOT set editingId.
            setEditingId(null);

            setFormData((prev) => ({
                ...prev,
                title: String(row?.title ?? ''),
                description: String(row?.description ?? ''),
                category: (row?.category ?? '言語交換') as EventCategory,
                date: dPart || '',
                location: String(row?.location ?? ''),
                minParticipants: Number(row?.minparticipants ?? 2),
                maxParticipants: Number(row?.maxparticipants ?? 10),
                fee: typeof row?.fee === 'number' ? row.fee : 0,
                tags: Array.isArray(row?.tags) ? row.tags : [],
                inoutdoor: (row?.inoutdoor === 'out' ? 'out' : 'in') as any,
            }));

            setTime(tPart || '');
            setSelectedLanguages(Array.isArray(row?.languages) ? row.languages : []);
            setImages(Array.isArray(row?.images) ? row.images : []);
            setImageInput('');
            setTagInput('');
            setIsTemplateModalOpen(false);
            setPageMode('form');
        } catch (e: any) {
            const errInfo = {
                at: new Date().toISOString(),
                where: 'loadEventAsTemplate',
                message: e?.message ?? String(e),
                row,
            };
            setLastDebug(errInfo);
            console.error('[create/history] loadEventAsTemplate error', errInfo);
            alert(`TypeError: ${errInfo.message}`);
        }
    };

    const isEditMode = editingId !== null;

    const computeStatus = (dateText: string | null | undefined): 'hold' | 'completed' => {
        if (!dateText) return 'hold';
        const isoCandidate = dateText.includes('T') ? dateText : dateText.replace(' ', 'T');
        const d = new Date(isoCandidate);
        if (Number.isNaN(d.getTime())) return 'hold';
        return d.getTime() < Date.now() ? 'completed' : 'hold';
    };

    const canEditEvent = (row: any) => computeStatus(row?.date) !== 'completed';

    const resetToCreateMode = () => {
        setEditingId(null);
        setFormData({
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
        setSelectedLanguages([]);
        setImages([]);
        setImageInput('');
        setTagInput('');
        setTime('');
        setPageMode('top');
    };

    const fetchHistory = async () => {
        setHistoryLoading(true);
        setHistoryError(null);

        const { data, error } = await supabase
            .schema('public')
            .from('events')
            .select('id,title,category,date,location,minparticipants,maxparticipants,currentparticipants,fee,languages,tags,images,description,inoutdoor')
            .order('created_at', { ascending: false })
            .limit(20);

        const debugPayload = {
            at: new Date().toISOString(),
            error: error
                ? {
                    message: error.message,
                    code: (error as any).code,
                    details: (error as any).details,
                    hint: (error as any).hint,
                }
                : null,
            dataType: Array.isArray(data) ? 'array' : typeof data,
            length: Array.isArray(data) ? data.length : null,
            sample: Array.isArray(data) ? data.slice(0, 2) : data,
        };
        setLastDebug(debugPayload);
        console.log('[create/history] fetchHistory', debugPayload);

        if (error) {
            setHistoryError(error.message);
            setHistoryEvents([]);
            setHistoryLoading(false);
            return;
        }

        setHistoryEvents(data || []);
        setHistoryLoading(false);
    };

    useEffect(() => {
        if (isTemplateModalOpen || isEditModalOpen) {
            fetchHistory();
        }
    }, [isTemplateModalOpen, isEditModalOpen]);

    const loadEventIntoForm = (row: any) => {
        try {
            const dateText: string = String(row?.date ?? '');
            const [dPart, tPart] = dateText.split(' ');

            setEditingId(String(row.id));

            setFormData((prev) => ({
                ...prev,
                title: String(row?.title ?? ''),
                description: String(row?.description ?? ''),
                category: (row?.category ?? '言語交換') as EventCategory,
                date: dPart || '',
                location: String(row?.location ?? ''),
                minParticipants: Number(row?.minparticipants ?? 2),
                maxParticipants: Number(row?.maxparticipants ?? 10),
                fee: typeof row?.fee === 'number' ? row.fee : 0,
                tags: Array.isArray(row?.tags) ? row.tags : [],
                inoutdoor: (row?.inoutdoor === 'out' ? 'out' : 'in') as any,
            }));

            setTime(tPart || '');
            setSelectedLanguages(Array.isArray(row?.languages) ? row.languages : []);
            setImages(Array.isArray(row?.images) ? row.images : []);
            setIsEditModalOpen(false);
            setPageMode('form');
        } catch (e: any) {
            const errInfo = {
                at: new Date().toISOString(),
                where: 'loadEventIntoForm',
                message: e?.message ?? String(e),
                row,
            };
            setLastDebug(errInfo);
            console.error('[create/history] loadEventIntoForm error', errInfo);
            alert(`TypeError: ${errInfo.message}`);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'minParticipants' || name === 'maxParticipants' || name === 'fee' ? Number(value) : value,
        }));
    };

    const setInOutDoor = (value: 'in' | 'out') => {
        setFormData((prev) => ({
            ...prev,
            inoutdoor: value,
        }));
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
        const next = imageInput.trim();
        if (next && !images.includes(next)) {
            setImages((prev) => [...prev, next]);
            setImageInput('');
        }
    };

    const removeImage = (url: string) => {
        setImages((prev) => prev.filter((img) => img !== url));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const pendingImage = imageInput.trim();
        const mergedImages = pendingImage && !images.includes(pendingImage)
            ? [...images, pendingImage]
            : images;

        const normalizedImages = mergedImages
            .map((u) => u.trim())
            .filter((u) => u.length > 0);

        const submitData = {
            ...formData,
            languages: selectedLanguages,
            tags: (formData.tags || []).map((t) => t.trim()).filter((t) => t.length > 0),
            images: normalizedImages,
            time,
        };

        if (!supabase) {
            alert(
                'Supabaseの設定が見つかりません（.env.local の NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を確認してください）'
            );
            return;
        }

        const dateTimeText = submitData.date
            ? `${submitData.date}${submitData.time ? ` ${submitData.time}` : ''}`
            : '';

        const dayOfWeek = submitData.dayOfWeek ?? 'mon';
        const period = submitData.period ?? 1;

        if (isEditMode) {
            const { error } = await supabase
                .schema('public')
                .from('events')
                .update({
                    title: submitData.title,
                    description: submitData.description,
                    category: submitData.category,
                    date: dateTimeText,
                    dayofweek: dayOfWeek,
                    period,
                    location: submitData.location,
                    minparticipants: submitData.minParticipants ?? 2,
                    maxparticipants: submitData.maxParticipants,
                    fee: submitData.fee ?? 0,
                    languages: submitData.languages,
                    tags: submitData.tags,
                    images: submitData.images,
                    inoutdoor: submitData.inoutdoor ?? 'in',
                })
                .eq('id', editingId as string);

            if (error) {
                console.error('Supabase update error:', error);
                alert(`更新に失敗しました: ${error.message}`);
                return;
            }

            alert(`イベントを更新しました！（id=${editingId}）`);
            resetToCreateMode();
            return;
        }

        const id = String(Date.now());

        const { error } = await supabase
            .schema('public')
            .from('events')
            .insert({
                id,
                title: submitData.title,
                description: submitData.description,
                category: submitData.category,
                date: dateTimeText,
                dayofweek: dayOfWeek,
                period,
                location: submitData.location,
                minparticipants: submitData.minParticipants ?? 2,
                maxparticipants: submitData.maxParticipants,
                currentparticipants: 0,
                fee: submitData.fee ?? 0,
                languages: submitData.languages,
                organizer_id: null,
                organizer_name: '未設定',
                organizer_avatar: '',
                tags: submitData.tags,
                images: submitData.images,
                inoutdoor: submitData.inoutdoor ?? 'in',
            });

        if (error) {
            console.error('Supabase insert error:', error);
            alert(`保存に失敗しました: ${error.message}`);
            return;
        }

        alert(`イベントが作成されました！（id=${id}）`);
    };

    // トップページレンダリング
    if (pageMode === 'top') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-4">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Createのトップページ</h1>
                        <p className="text-sm text-gray-600">イベント作成</p>
                    </div>

                    <button
                        onClick={() => setPageMode('form')}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        イベント作成
                    </button>

                    <button
                        onClick={() => setIsTemplateModalOpen(true)}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        履歴から作成
                    </button>

                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        作成済みイベントを編集
                    </button>
                </div>

                {/* 履歴から作成モーダル */}
                <HistoryModal
                    isOpen={isTemplateModalOpen}
                    onClose={() => setIsTemplateModalOpen(false)}
                    title="イベント履歴（最新20件）"
                    historyLoading={historyLoading}
                    historyError={historyError}
                    historyEvents={historyEvents}
                    onRefresh={fetchHistory}
                    onSelectEvent={loadEventAsTemplate}
                    mode="template"
                    canEditEvent={canEditEvent}
                    computeStatus={computeStatus}
                />

                {/* 作成済みイベントを編集モーダル */}
                <HistoryModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="作成済みイベントを編集"
                    historyLoading={historyLoading}
                    historyError={historyError}
                    historyEvents={historyEvents}
                    onRefresh={fetchHistory}
                    onSelectEvent={loadEventIntoForm}
                    mode="edit"
                    canEditEvent={canEditEvent}
                    computeStatus={computeStatus}
                />
            </div>
        );
    }

    // フォームページレンダリング
    return (
        <div className="py-3 space-y-3">
            <div className="bg-white rounded-lg shadow-sm p-3 mx-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setPageMode('top')}
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
                    {isEditMode && (
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

            {debugOpen && (
                <div className="bg-black text-green-200 rounded-lg shadow-sm p-3 mx-2 text-[10px] overflow-x-auto">
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

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        タイトル <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="例: 日本語&英語で話そう！"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                        required
                    />
                </div>

                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
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

                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        開催日時 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
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

                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        場所 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="例: 渋谷カフェ"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                        required
                    />
                </div>

                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
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

                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
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
                                onChange={handleInputChange}
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
                                onChange={handleInputChange}
                                min={2}
                                max={100}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        参加費（円）
                    </label>
                    <input
                        type="number"
                        name="fee"
                        value={formData.fee}
                        onChange={handleInputChange}
                        min={0}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                </div>

                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
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

                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        詳細 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="イベントの内容を記入"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm"
                        required
                    />
                </div>

                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
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

                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
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

                <div className="mx-2 pb-4">
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
    );
}