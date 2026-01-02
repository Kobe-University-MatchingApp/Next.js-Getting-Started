'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getProfile } from '@/lib/profile';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === 'signup') {
                // サインアップ：Profileにデータを追加
                const { data, error } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            name: name,
                            age: 0, // デフォルト値
                            location: '',
                            occupation: '',
                            bio: '',
                            interests: [],
                            images: [],
                            native_language: '',
                            learning_languages: [],
                            exchange_goals: [],
                        }
                    ])
                    .select()
                    .single();

                if (error) {
                    console.error('Signup error:', error);
                    if (error.code === '42501') {
                        alert('サインアップに失敗しました。\n\nSupabaseのRow Level Security (RLS)ポリシーを設定する必要があります。\n\nSupabaseダッシュボードで以下のSQL文を実行してください：\n\n-- INSERT権限を許可\nCREATE POLICY "Enable insert for all users" ON profiles FOR INSERT WITH CHECK (true);\n\n-- SELECT権限を許可\nCREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);');
                    } else {
                        alert('サインアップに失敗しました: ' + error.message);
                    }
                    return;
                }

                // ローカルストレージに保存
                localStorage.setItem('userName', name);
                alert(`ようこそ、${name}さん！プロフィールを完成させましょう。`);
            } else {
                // ログイン：Profileに名前が存在するか確認
                const profile = await getProfile(name);

                if (!profile) {
                    alert('アカウントが見つかりません。サインアップしてください。');
                    setMode('signup');
                    return;
                }

                // ローカルストレージに保存
                localStorage.setItem('userName', name);
                alert(`おかえりなさい、${name}さん！`);
            }

            // 認証処理後にモーダルを閉じる
            onClose();
        } catch (error) {
            console.error('Auth error:', error);
            alert('エラーが発生しました');
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        // フォームをリセット
        setName('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* オーバーレイ */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* モーダルコンテンツ */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                {/* 閉じるボタン */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* タイトル */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {mode === 'login' ? 'ログイン' : 'サインアップ'}
                    </h2>
                    <p className="text-sm text-gray-600">
                        {mode === 'login'
                            ? 'アカウントにログインしてください'
                            : '新しいアカウントを作成してください'
                        }
                    </p>
                </div>

                {/* フォーム */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            名前
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            placeholder="山田 太郎"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* 送信ボタン */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isLoading ? '処理中...' : mode === 'login' ? 'ログイン' : 'サインアップ'}
                    </button>
                </form>

                {/* モード切り替え */}
                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-600">
                        {mode === 'login' ? 'アカウントをお持ちでないですか？' : 'すでにアカウントをお持ちですか？'}
                    </span>
                    <button
                        onClick={switchMode}
                        className="ml-1 text-purple-600 hover:text-purple-700 font-semibold"
                    >
                        {mode === 'login' ? 'サインアップ' : 'ログイン'}
                    </button>
                </div>
            </div>
        </div>
    );
}
