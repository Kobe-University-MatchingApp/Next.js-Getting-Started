'use client';

import { useState } from 'react';
import { EventCategory, EventFormData } from '@/types/event';
import { supabase } from '@/lib/supabaseClient';

const categories: EventCategory[] = [
    '言語交換',
    '料理体験',
    '文化体験',
    'スポーツ',
    '観光',
    'その他',
];

const availableLanguages = [
    '日本語',
    '英語',
    '中国語',
    '韓国語',
    'スペイン語',
    'フランス語',
    'ドイツ語',
    'ポルトガル語',
    'その他',
];

export default function CreateEventPage() {
    const [formData, setFormData] = useState<EventFormData>({
        title: '',
        description: '',
        category: '言語交換',
        date: '',
        location: '',
        maxParticipants: 10,
        fee: 0,
        languages: [],
        tags: [],
        // NOTE: inoutdoor is stored in DB as 'in' | 'out'. Keep local typing here so we don't need to change shared types.
        inoutdoor: 'in',
    });

    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    const [images, setImages] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState('');

    const [time, setTime] = useState('');

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'maxParticipants' || name === 'fee' ? Number(value) : value,
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

        const normalizedImages = images
            .map((u) => u.trim())
            .filter((u) => u.length > 0);

        const submitData = {
            ...formData,
            languages: selectedLanguages,
            tags: (formData.tags || []).map((t) => t.trim()).filter((t) => t.length > 0),
            images: normalizedImages,
            time,
        };

        // Debug: verify images are present before insert
        console.log('Insert payload (events):', {
            images: submitData.images,
            imagesCount: submitData.images.length,
        });

        if (!supabase) {
            alert(
                'Supabaseの設定が見つかりません（.env.local の NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を確認してください）'
            );
            return;
        }

        // shared schema: date is text
        const dateTimeText = submitData.date
            ? `${submitData.date}${submitData.time ? ` ${submitData.time}` : ''}`
            : '';

        // schema allows null, but keep defaults for now
        const dayOfWeek = 'mon';
        const period = 1;

        // shared schema: id is text PK with no default
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

    return (
        <div className="py-3 space-y-3">
            <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                <h1 className="text-lg font-bold text-gray-800">イベント作成</h1>
            </div>

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
                                className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                                    formData.category === category
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
                    <div className="grid grid-cols-2 gap-2 mb-3">
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
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                最大参加人数
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
                        <div>
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
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        屋内 / 屋外 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setInOutDoor('in')}
                            className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                                (formData.inoutdoor ?? 'in') === 'in'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            Indoor
                        </button>
                        <button
                            type="button"
                            onClick={() => setInOutDoor('out')}
                            className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                                formData.inoutdoor === 'out'
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
                        対応言語 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {availableLanguages.map((language) => (
                            <button
                                key={language}
                                type="button"
                                onClick={() => toggleLanguage(language)}
                                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                    selectedLanguages.includes(language)
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
                            onKeyPress={(e) =>
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
                        イベントを作成
                    </button>
                </div>
            </form>
        </div>
    );
}
