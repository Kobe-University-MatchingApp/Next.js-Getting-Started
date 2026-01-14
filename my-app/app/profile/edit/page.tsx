// app/profile/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Supabaseクライアントをインポート

export default function ProfileEditPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // フォームデータ
    const [formData, setFormData] = useState({
        name: '',
        age: '', // inputでは文字列として扱う
        location: '',
        bio: '',
        image_url: '', // プロフィール画像のURL
    });

    // プリセット（デフォルト）の画像リスト
    const defaultImages = [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Willow',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Saitama',
    ];

    // 1. ページ読み込み時に、現在の自分のデータを取得する
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                // ログイン中のユーザーを取得
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    alert('ログインしてください');
                    router.push('/login'); // ログインしてなければログイン画面へ
                    return;
                }

                // プロフィールデータをDBから取得
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching profile:', error);
                    // まだプロフィールがない場合は、新規作成として扱うのでエラーにしない
                }

                if (data) {
                    setFormData({
                        name: data.name || '',
                        age: data.age ? String(data.age) : '',
                        location: data.location || '',
                        bio: data.bio || '',
                        image_url: data.images && data.images[0] ? data.images[0] : '',
                    });
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    // 入力変更ハンドラ
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 画像選択ハンドラ
    const selectImage = (url: string) => {
        setFormData(prev => ({ ...prev, image_url: url }));
    };

    // 2. 保存ボタンを押したときの処理（Supabaseへ保存）
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // 現在のユーザーIDを取得
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            // DB更新用データを作成
            const updates = {
                id: user.id, // 自分のID
                name: formData.name,
                age: formData.age ? parseInt(formData.age) : null, // 数値に変換
                location: formData.location,
                bio: formData.bio,
                images: [formData.image_url], // 配列として保存
                updated_at: new Date(),
            };

            // SupabaseにUpsert（更新、なければ作成）
            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

            alert('プロフィールを更新しました！');
            router.push('/profile'); // プロフィール画面に戻る

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('更新に失敗しました。');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center">読み込み中...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* ヘッダー */}
            <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
                <Link href="/profile" className="text-gray-600">
                   ← キャンセル
                </Link>
                <h1 className="text-lg font-bold text-gray-900">プロフィール編集</h1>
                <div className="w-10"></div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-lg mx-auto">
                
                {/* --- 画像選択セクション --- */}
                <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-bold text-gray-700">アイコン設定</p>
                    
                    {/* 現在のアイコンプレビュー */}
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-2 border-blue-100">
                            {formData.image_url ? (
                                <img src={formData.image_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                            )}
                        </div>
                    </div>

                    {/* プリセットから選択 */}
                    <div>
                        <p className="text-xs text-gray-500 mb-2">▼ デフォルト画像から選ぶ</p>
                        <div className="flex gap-2 justify-center">
                            {defaultImages.map((imgUrl, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => selectImage(imgUrl)}
                                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                                        formData.image_url === imgUrl ? 'border-blue-500 scale-110' : 'border-transparent hover:border-gray-300'
                                    }`}
                                >
                                    <img src={imgUrl} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* カスタムURL入力 (一時的な対応) */}
                    <div>
                        <p className="text-xs text-gray-500 mb-1">▼ または画像のURLを入力</p>
                        <input
                            type="text"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full p-2 text-xs border border-gray-300 rounded"
                        />
                    </div>
                </div>


                {/* 基本情報編集フォーム */}
                <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-sm font-bold text-gray-700">基本情報</h2>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">名前</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">場所</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>
                </div>

                {/* 保存ボタン */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all
                            ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}
                        `}
                    >
                        {saving ? '保存中...' : '変更を保存する'}
                    </button>
                </div>
            </form>
        </div>
    );
}