'use client';

import { useCallback, useMemo, useState } from 'react';
import { EventFormData } from '@/types/event';
import CreateFormModal from './_components/CreateFormModal';
import HistoryModal from './_components/HistoryModal';
import { createClient } from '@supabase/supabase-js';

// Supabase client (client-side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;

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

export default function CreateEventPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [formData, setFormData] = useState<EventFormData>(emptyForm);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    const [images, setImages] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState('');
    const [time, setTime] = useState('');

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // History state
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [historyEvents, setHistoryEvents] = useState<any[]>([]);

    // debug panel
    const [debugOpen, setDebugOpen] = useState(false);
    const [lastDebug, setLastDebug] = useState<any>(null);

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

    const resetToCreateMode = () => {
        setIsEditMode(false);
        setEditingId(null);
        setFormData(emptyForm);
        setSelectedLanguages([]);
        setImages([]);
        setTime('');
        setTagInput('');
        setImageInput('');
    };

    const computeStatus = (dateText: string | null | undefined) => {
        // dateText can be ISO date string
        if (!dateText) return 'hold' as const;
        const d = new Date(dateText);
        if (Number.isNaN(d.getTime())) return 'hold' as const;
        return d.getTime() < Date.now() ? ('completed' as const) : ('hold' as const);
    };

    const canEditEvent = (row: any) => {
        // "still not finished" only
        return computeStatus(row?.date) === 'hold';
    };

    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        setHistoryError(null);

        const createdBy = '*';

        if (!supabase) {
            setHistoryLoading(false);
            setHistoryError('Supabaseの設定が見つかりません（環境変数を確認してください）');
            return;
        }

        try {
            const { data, error } = await supabase
                // Actual table: public.events
                .from('events')
                .select('*')
                // TODO(auth): replace '*' with real user id
                // .eq('organizer_id', createdBy)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setHistoryEvents(data ?? []);
            setLastDebug({ createdBy, rows: (data ?? []).length });
        } catch (err: any) {
            setHistoryError(err?.message ?? '履歴の取得に失敗しました');
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    const openCreateNew = () => {
        resetToCreateMode();
        setIsCreateModalOpen(true);
    };

    const openTemplateHistory = async () => {
        setIsTemplateModalOpen(true);
        await fetchHistory();
    };

    const openEditHistory = async () => {
        setIsEditModalOpen(true);
        await fetchHistory();
    };

    const onSelectTemplate = (row: any) => {
        // apply row values into form (id not used for now)
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

        setIsTemplateModalOpen(false);
        setIsCreateModalOpen(true);
    };

    const onSelectEdit = (row: any) => {
        if (!canEditEvent(row)) return;

        setIsEditMode(true);
        setEditingId(String(row?.id ?? ''));

        // populate same as template
        onSelectTemplate(row);

        // reopen create modal in edit mode
        setIsCreateModalOpen(true);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!supabase) {
            alert('Supabaseの設定が見つかりません（環境変数を確認してください）');
            return;
        }

        // Map to existing public.events columns
        const payload = {
            // id is text PK; generate a simple unique id for now (no auth/user binding yet)
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
            organizer_id: '*',
            organizer_name: '*',
            organizer_avatar: null,
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
            alert('イベントが作成されました！');
            setIsCreateModalOpen(false);
            resetToCreateMode();
            return;
        }

        if (!editingId) {
            alert('編集対象が見つかりません');
            return;
        }

        // For update, do not replace id
        const { id: _drop, ...updatePayload } = payload as any;

        const { error } = await supabase
            .from('events')
            .update(updatePayload)
            .eq('id', editingId);

        if (error) {
            alert(`更新に失敗しました: ${error.message}`);
            return;
        }

        alert('イベントを更新しました！');
        setIsCreateModalOpen(false);
        resetToCreateMode();
    };

    return (
        <div className="py-3 space-y-3">
            <div className="bg-white rounded-lg shadow-sm p-3 mx-2 flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-800">イベント作成</h1>
                <button
                    type="button"
                    onClick={openCreateNew}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-bold"
                >
                    新規作成
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-3 mx-2 space-y-2">
                <button
                    type="button"
                    onClick={openTemplateHistory}
                    className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold"
                >
                    履歴から作成
                </button>
                <button
                    type="button"
                    onClick={openEditHistory}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
                >
                    未完了の作成履歴を編集
                </button>
                <p className="text-[11px] text-gray-500">
                    ※ まだ権限チェックを入れていないため、ユーザーIDは一旦「*」として扱います。
                </p>
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
                imageInput={imageInput}
                setImageInput={setImageInput}
                addImage={addImage}
                removeImage={removeImage}
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
            />

            <HistoryModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="未完了の作成履歴を編集"
                historyLoading={historyLoading}
                historyError={historyError}
                historyEvents={historyEvents}
                onRefresh={fetchHistory}
                onSelectEvent={onSelectEdit}
                mode="edit"
                canEditEvent={canEditEvent}
                computeStatus={computeStatus}
            />
        </div>
    );
}
