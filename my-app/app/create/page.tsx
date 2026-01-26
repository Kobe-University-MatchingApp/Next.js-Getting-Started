'use client';

import { useEffect, useState } from 'react';
import { EventCategory, EventFormData } from '@/types/event';
import { supabase } from '@/lib/supabaseClient';
import { EVENT_CATEGORIES, AVAILABLE_LANGUAGES } from '@/lib/constants';
import { useModal } from '@/app/_contexts/ModalContext';
import { getCurrentUser, getCurrentUserProfile } from '@/lib/home_recommend';
import { getProfileById } from '@/lib/profile';
import HistoryModal from './_components/HistoryModal';
import CreateFormModal from './_components/CreateFormModal';

const categories: EventCategory[] = EVENT_CATEGORIES;

const availableLanguages = AVAILABLE_LANGUAGES;

export default function CreateEventPage() {
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateFormModalOpen, setIsCreateFormModalOpen] = useState(false);
    const { setIsModalOpen } = useModal();

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
            setIsCreateFormModalOpen(true);
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

    // モーダル開閉時にグローバル状態を更新（BottomNavの表示制御）
    useEffect(() => {
        const isAnyModalOpen = isTemplateModalOpen || isEditModalOpen || isCreateFormModalOpen;
        setIsModalOpen(isAnyModalOpen);
    }, [isTemplateModalOpen, isEditModalOpen, isCreateFormModalOpen, setIsModalOpen]);

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
            setIsCreateFormModalOpen(true);
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

        // 現在のユーザー情報を取得
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            alert('ユーザー情報の取得に失敗しました。ログインしてください。');
            return;
        }

        const userProfile = await getProfileById(currentUser.id);
        if (!userProfile) {
            alert('ユーザープロフィールの取得に失敗しました。');
            return;
        }

        const dateTimeText = submitData.date
            ? `${submitData.date}${submitData.time ? ` ${submitData.time}` : ''}`
            : '';

        const dayOfWeek = submitData.dayOfWeek ?? 'mon';
        const period = submitData.period ?? 1;

        // organizer情報を取得
        const organizerData = {
            organizer_id: currentUser.id,
            organizer_name: userProfile.name,
            organizer_avatar: userProfile.images && userProfile.images.length > 0 ? userProfile.images[0] : '',
        };

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
                    ...organizerData,
                })
                .eq('id', editingId as string);

            if (error) {
                console.error('Supabase update error:', error);
                alert(`更新に失敗しました: ${error.message}`);
                return;
            }

            alert(`イベントを更新しました！（id=${editingId}）`);
            setIsCreateFormModalOpen(false);
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
                tags: submitData.tags,
                images: submitData.images,
                inoutdoor: submitData.inoutdoor ?? 'in',
                ...organizerData,
            });

        if (error) {
            console.error('Supabase insert error:', error);
            alert(`保存に失敗しました: ${error.message}`);
            return;
        }

        alert(`イベントが作成されました！（id=${id}）`);
        setIsCreateFormModalOpen(false);
        resetToCreateMode();
    };

    // トップページレンダリング
    return (
        <div className="py-3 space-y-3 min-h-screen bg-gray-50">
            {/* ヘッダー */}
            <div className="bg-white border-b border-gray-200 p-4 mx-0">
                <h1 className="text-xl font-bold text-gray-900">イベント作成</h1>
            </div>

            {/* メインコンテンツ */}
            <div className="flex items-center justify-center p-8 pt-20">
                <div className="w-full max-w-md space-y-4">
                    <button
                        onClick={() => setIsCreateFormModalOpen(true)}
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

            {/* イベント作成フォームモーダル */}
            <CreateFormModal
                isOpen={isCreateFormModalOpen}
                onClose={() => setIsCreateFormModalOpen(false)}
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
                onSubmit={handleSubmit}
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
        </div>
    );
}