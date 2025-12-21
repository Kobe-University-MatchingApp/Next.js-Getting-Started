'use client';

import { useState } from 'react';
import { EventCategory, EventFormData } from '@/types/event';
import { createClient } from '@supabase/supabase-js';

// NOTE(DB/Supabase placeholder):
// We will use Supabase Postgres (not MySQL). Supabase provides:
// - SQL editor (DDL/DML similar to your example)
// - JS client for queries from Next.js
//
// TODO(DB): When the team is ready, add and use a shared client like:
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
//
// Example (DDL) in Supabase SQL editor:
// create schema if not exists create_event;
// create table create_event.created_data (
//   id uuid primary key default gen_random_uuid(),
//   title text not null,
//   category text not null,
//   event_date date not null,
//   event_time text not null,
//   location text not null,
//   max_participants int not null,
//   fee int not null default 0,
//   languages text[] not null default '{}',
//   description text not null,
//   tags text[] not null default '{}',
//   images text[] not null default '{}',
//   created_at timestamptz not null default now()
// );
//
// Example (insert) from this page later:
// await supabase.schema('create_event').from('created_data').insert({
//   title, category, event_date: date, event_time: time, location,
//   max_participants: maxParticipants,
//   fee, languages, description, tags, images,
// });
//
// Example (update/delete) later:
// await supabase.schema('create_event').from('created_data').update({ title: 'New' }).eq('id', eventId);
// await supabase.schema('create_event').from('created_data').delete().eq('id', eventId);

// Supabase client (client-side)
// IMPORTANT:
// - In Next.js client components, only NEXT_PUBLIC_* env vars are available.
// - Use the anon key for client-side inserts (RLS must allow it) or move writes to an API route.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

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
        time: '',
        location: '',
        maxParticipants: 10,
        fee: 0,
        languages: [],
        images: [],
        tags: [],
    });

    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [imageInput, setImageInput] = useState('');

    // images are not part of EventFormData in this repo snapshot, so keep separate state
    const [images, setImages] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState('');

    // images are not part of EventFormData in this repo snapshot, so keep separate state
    const [images, setImages] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState('');

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'maxParticipants' || name === 'fee' ? Number(value) : value,
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
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()],
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        if (imageInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                images: [...(prev.images || []), imageInput.trim()],
            }));
=======
        const next = imageInput.trim();
        if (next && !images.includes(next)) {
            setImages((prev) => [...prev, next]);
>>>>>>> Stashed changes
=======
        const next = imageInput.trim();
        if (next && !images.includes(next)) {
            setImages((prev) => [...prev, next]);
>>>>>>> Stashed changes
            setImageInput('');
        }
    };

    const removeImage = (url: string) => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        setFormData((prev) => ({
            ...prev,
            images: prev.images?.filter((img) => img !== url),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
=======
=======
>>>>>>> Stashed changes
        setImages((prev) => prev.filter((img) => img !== url));
    };

    const handleSubmit = async (e: React.FormEvent) => {
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        e.preventDefault();

        const submitData = {
            ...formData,
            languages: selectedLanguages,
            tags: formData.tags || [],
            images,
        };

        console.log('イベント作成:', submitData);

<<<<<<< Updated upstream
<<<<<<< Updated upstream
        // 一時対応: localStorage に保存して /find から読めるようにする（ブラウザ単位）
        try {
            const key = 'userEvents';
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
            const prev: any[] = raw ? JSON.parse(raw) : [];
            // 簡易ID発行（本番ではサーバー側で行う）
            const newId = `local-${Date.now()}`;
            const newEvent = {
                id: newId,
                currentParticipants: 0,
                organizer: {
                    id: 'local-organizer',
                    name: '未設定',
                    avatar: 'https://via.placeholder.com/40?text=U',
                },
                ...submitData,
            };
            window.localStorage.setItem(key, JSON.stringify([...prev, newEvent]));
        } catch (err) {
            console.error('localStorageへの保存に失敗しました', err);
        }

        // TODO(DB): 将来ここで /api/events に POST して MySQL などのDBに保存する
        // 例:
        // await fetch('/api/events', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(submitData),
        // });

        // 現時点ではデモのためアラートのみ
        alert('イベントが作成されました！');
=======
=======
>>>>>>> Stashed changes
        if (!supabase) {
            alert('Supabaseの設定が見つかりません（環境変数を確認してください）');
            return;
        }

        const { error } = await supabase
            .schema('create_event')
            .from('created_data')
            .insert({
                title: submitData.title,
                category: submitData.category,
                event_date: submitData.date,
                event_time: submitData.time,
                location: submitData.location,
                description: submitData.description,
                max_participants: submitData.maxParticipants,
                fee: submitData.fee ?? 0,
                current_participants: 0,
                languages: submitData.languages,
                tags: submitData.tags,
                images: submitData.images,
            });

        if (error) {
            console.error('Supabase insert error:', error);
            alert(`保存に失敗しました: ${error.message}`);
            return;
        }

        alert('イベントが作成されました！（Supabaseに保存しました）');
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    };

    return (
        <div className="py-3 space-y-3">
            {/* ヘッダー */}
            <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                <h1 className="text-lg font-bold text-gray-800">イベント作成</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* イベントタイトル */}
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

                {/* カテゴリー */}
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

                {/* 日時と場所 */}
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
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
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

                {/* 参加人数・参加費 */}
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
                                min="2"
                                max="100"
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
                                min="0"
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* 対応言語 */}
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

                {/* イベント詳細 */}
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

                {/* 画像URL */}
                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        画像URL（任意・複数可）
                    </label>
                    <div className="flex gap-1.5 mb-2">
                        <input
                            type="url"
                            value={imageInput}
                            onChange={(e) => setImageInput(e.target.value)}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                            onKeyPress={(e) =>
                                e.key === 'Enter' && (e.preventDefault(), addImage())
                            }
=======
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
>>>>>>> Stashed changes
=======
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                        {formData.images?.map((url) => (
=======
                        {images.map((url) => (
>>>>>>> Stashed changes
=======
                        {images.map((url) => (
>>>>>>> Stashed changes
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
                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        タグ
                    </label>
                    <div className="flex gap-1.5 mb-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
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

                {/* 作成ボタン */}
                <div className="mx-2 pb-4">
                    <button
                        type="submit"
                        disabled={selectedLanguages.length === 0}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold text-sm disabled:opacity-50"
                    >
                        🎉 イベントを作成
                    </button>
                </div>
            </form>
        </div>
    );
}
