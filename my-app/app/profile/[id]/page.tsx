// プロフィールページのコンポーネント

import { getProfileById } from '@/lib/profile';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import RegisteredEvents from './_components/RegisteredEvents';

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 現在のユーザーを取得して、本人かどうか確認
    const { data: { user } } = await supabase.auth.getUser();
    const isOwnProfile = user?.id === id;

    // プロフィールデータを取得
    const profile = await getProfileById(id);

    // プロフィールが存在しない場合の処理
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

            {/* プロフィール画像 */}
            <div className="relative bg-white border-b border-gray-200 overflow-hidden mx-0">
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
            </div>

            {/* 自己紹介 */}
            <div className="bg-white border-b border-gray-200 p-4 mx-0">
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 whitespace-pre-wrap">{profile.bio}</p>
            </div>

            {/* 参加予定のイベント（本人のみ表示） */}
            {isOwnProfile && <RegisteredEvents />}

            {/* 言語スキル */}
            <div className="bg-white border-b border-gray-200 p-4 mx-0">
                <h3 className="text-sm font-bold text-gray-800 mb-2">🌐 言語</h3>
                <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {profile.nativeLanguage}
                    </span>
                    {profile.learningLanguages?.map((language) => {
                        const level = profile.languageLevel?.[language] || 'beginner';
                        return (
                            <span key={language} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {language} {levelText[level] || level}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* 趣味・興味 */}
            <div className="bg-white border-b border-gray-200 p-4 mx-0">
                <h3 className="text-sm font-bold text-gray-800 mb-2">💫 趣味</h3>
                <div className="flex flex-wrap gap-1.5">
                    {profile.interests?.map((interest, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                            {interest}
                        </span>
                    ))}
                </div>
            </div>

            {/* 交流の目的 */}
            <div className="bg-white border-b border-gray-200 p-4 mx-0">
                <h3 className="text-sm font-bold text-gray-800 mb-2">🎯 交流の目的</h3>
                <div className="flex flex-wrap gap-1.5">
                    {profile.exchangeGoals?.map((goal, index) => (
                        <span key={index} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                            {goal}
                        </span>
                    ))}
                </div>
            </div>

            {/* 学習スタイル */}
            {profile.studyStyle && profile.studyStyle.length > 0 && (
                <div className="bg-white border-b border-gray-200 p-4 mx-0">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">📖 学習スタイル</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {profile.studyStyle.map((style, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                {style}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* 参加可能な時間帯 */}
            {profile.availability && profile.availability.length > 0 && (
                <div className="bg-white border-b border-gray-200 p-4 mx-0">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">🕐 参加可能時間</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {profile.availability.map((time, index) => (
                            <span key={index} className="px-2 py-1 bg-pink-50 text-pink-700 rounded text-xs">
                                {time}
                            </span>
                        ))}
                    </div>
                </div>
            )}

        </div>

    );
}