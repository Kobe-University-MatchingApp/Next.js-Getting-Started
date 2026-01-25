<<<<<<< Updated upstream
import { getProfileById } from '@/lib/profile';
import { notFound } from 'next/navigation';
=======
// プロフィールページのコンポーネント

import { getProfileById } from '@/lib/profile';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
>>>>>>> Stashed changes
import Link from 'next/link';

// キャッシュを無効化し、常に最新のデータを取得する
export const dynamic = 'force-dynamic';

export default async function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
<<<<<<< Updated upstream
=======
    const supabase = await createClient();
    
    // 現在のユーザーを取得して、本人かどうか確認
    const { data: { user } } = await supabase.auth.getUser();
    const isOwnProfile = user?.id === id;

    // プロフィールデータを取得
>>>>>>> Stashed changes
    const profile = await getProfileById(id);

    if (!profile) {
        return notFound();
    }

    // レベル表示用のテキストマッピング
    const levelText: Record<string, string> = {
        beginner: '初級',
        intermediate: '中級',
        advanced: '上級',
        native: 'ネイティブ',
    };

    return (
<<<<<<< Updated upstream
        <div className="space-y-3 py-3 pb-20">
=======
        <div className="py-3 space-y-3 min-h-screen pb-20">
            {/* ヘッダー */}
            <div className="bg-white border-b border-gray-200 p-4 mx-0 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">プロフィール</h1>
                {isOwnProfile && (
                     <Link
                        href={`/profile/${id}/edit`}
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1"
                    >
                        ✏️ 編集
                    </Link>
                )}
            </div>

>>>>>>> Stashed changes
            {/* プロフィール画像 */}
            <div className="relative bg-white rounded-lg shadow-sm overflow-hidden mx-2">
                <div className="relative h-56">
                    <img
                        src={profile.images[0] || 'https://placehold.co/400x600?text=No+Image'}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <h2 className="text-xl font-bold text-white">
                            {profile.name}, {profile.age}
                        </h2>
                        <p className="text-white/90 text-xs flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {profile.location} • {profile.occupation}
                        </p>
                    </div>
                </div>
                {/* 編集ボタン（本来は自分のプロフィールの場合のみ表示すべき） */}
                <Link 
                    href={`/profile/${id}/edit`}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-sm backdrop-blur-sm transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </Link>
            </div>

            {/* 自己紹介 */}
            <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 whitespace-pre-wrap">{profile.bio}</p>
            </div>

            {/* 言語スキル */}
            <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                <h3 className="text-sm font-bold text-gray-800 mb-2">🌐 言語</h3>
                <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {profile.nativeLanguage} (ネイティブ)
                    </span>
                    {profile.learningLanguages.map((lang) => (
                        <span key={lang} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            {lang} {profile.languageLevel?.[lang] ? `(${levelText[profile.languageLevel[lang]]})` : ''}
                        </span>
                    ))}
                </div>
            </div>

            {/* 興味・関心 */}
            <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                <h3 className="text-sm font-bold text-gray-800 mb-2">✨ 興味・関心</h3>
                <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((interest) => (
                        <span key={interest} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {interest}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
