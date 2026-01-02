// イベント作成ページ

'use client';

import { useState } from 'react';
import { EventFormData } from '@/types/event';
import { createClient } from '@supabase/supabase-js';
import { EVENT_CATEGORIES, AVAILABLE_LANGUAGES } from '@/lib/constants';

// Supabase client (client-side)
// IMPORTANT:
// - In Next.js client components, only NEXT_PUBLIC_* env vars are available.
// - Use the anon key for client-side inserts (RLS must allow it) or move writes to an API route.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;

export default function CreateEventPage() {

    // フォームデータの状態管理
    const [formData, setFormData] = useState<EventFormData>({
        title: '',
        description: '',
        category: '言語交換',
        date: '',
        dayOfWeek: '',
        period: 1,
        location: '',
        maxParticipants: 10,
        fee: 0,
        languages: [],
        tags: [],
    });

    // 対応言語の状態管理
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Images are not part of EventFormData in the main branch snapshot.
    const [images, setImages] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState('');

    // time is not present in EventFormData (main branch). Keep it local.
    const [time, setTime] = useState('');

    // フォーム入力変更時に実行される関数
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'maxParticipants' || name === 'fee' ? Number(value) : value,
        }));
    };

    // 言語の選択・解除をトグルする関数
    const toggleLanguage = (language: string) => {
        setSelectedLanguages((prev) =>
            prev.includes(language)
                ? prev.filter((l) => l !== language)
                : [...prev, language]
        );
    };

    // 趣味タグの追加・削除関数
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

    // 趣味タグ削除
    const removeTag = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags?.filter((t) => t !== tag),
        }));
    };

    // 画像URLの追加・削除関数
    const addImage = () => {
        const next = imageInput.trim();
        if (next && !images.includes(next)) {
            setImages((prev) => [...prev, next]);
            setImageInput('');
        }
    };

    // 画像URL削除
    const removeImage = (url: string) => {
        setImages((prev) => prev.filter((img) => img !== url));
    };

    // フォーム送信時に実行される関数
    // async: この関数内でawaitを使うため非同期関数として定義
    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault(); // フォームのデフォルトの送信動作=再読み込みを防止

        const submitData = {
            ...formData,
            languages: selectedLanguages,
            tags: formData.tags || [],
            images,
            time,
        };

        console.log('イベント作成:', submitData);

        // If env vars are not set, keep it as a demo / no-op.
        if (!supabase) {
            alert(
                'Supabaseの設定が見つかりません（.env.local の NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を確認してください）'
            );
            return;
        }

        // Supabaseにデータを挿入
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

        // エラーハンドリング
        if (error) {
            console.error('Supabase insert error:', error);
            alert(`保存に失敗しました: ${error.message}`);
            return;
        }

        // 成功時の処理（ゆくゆくはプレビューを挟んで→作成保存→成功画面）
        alert('イベントが作成されました！（Supabaseに保存しました）');
    };

    return (
        <div className="py-3 space-y-3 min-h-screen pb-20">
            {/* ヘッダー */}
            <div className="bg-white border-b border-gray-200 p-4 mx-0">
                <h1 className="text-xl font-bold text-gray-900">イベント作成</h1>
            </div>

            {/* フォーム */}
            <form onSubmit={handleSubmit} className="space-y-3">

                {/* タイトル入力 */}
                <div className="bg-white border-b border-gray-200 p-4 mx-0">
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

                {/* カテゴリー選択 */}
                <div className="bg-white border-b border-gray-200 p-4 mx-0">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        カテゴリー <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {EVENT_CATEGORIES.map((category) => (
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

                {/* 開催日時・場所入力 */}
                <div className="bg-white border-b border-gray-200 p-4 mx-0">
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

                {/* 最大参加人数・参加費入力 */}
                <div className="bg-white border-b border-gray-200 p-4 mx-0">
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

                {/* 対応言語選択 */}
                <div className="bg-white border-b border-gray-200 p-4 mx-0">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        対応言語 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_LANGUAGES.map((language) => (
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

                {/* 詳細入力 */}
                <div className="bg-white border-b border-gray-200 p-4 mx-0">
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

                {/* 画像URL入力 */}
                <div className="bg-white border-b border-gray-200 p-4 mx-0">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        画像URL（任意・複数可）
                    </label>
                    <div className="flex gap-1.5 mb-2">
                        <input
                            type="url"
                            value={imageInput}
                            onChange={(e) => setImageInput(e.target.value)}
                            // Enterキー押下時の処理
                            // inputタグ内でEnterを押すと通常はフォーム全体が送信されてしまうが、addImageだけを実行する
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

                {/* 趣味タグ入力 */}
                <div className="bg-white border-b border-gray-200 p-4 mx-0">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        タグ
                    </label>
                    <div className="flex gap-1.5 mb-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            // Enterキー押下時の処理
                            // inputタグ内でEnterを押すと通常はフォーム全体が送信されてしまうが、addTagだけを実行する
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
                <div className="mx-0 px-4 pb-4">
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
