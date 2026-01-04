'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getProfile } from '@/lib/profile';
import { Profile } from '@/types/profile';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  // デモ用：現在のユーザープロファイルをシミュレート
  // 実際はDBからユーザーIDで取得する
  useEffect(() => {
    // 仮のデータをロード
    getProfile('John Smith').then((data) => {
        if (data && user) {
            // Googleログインユーザーの情報で上書き
            setProfile({
                ...data,
                name: user.user_metadata.full_name || user.email || data.name,
                images: [user.user_metadata.avatar_url || data.images[0]],
            });
        } else {
            setProfile(data);
        }
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (!profile) {
    return <div className="p-10 text-center text-gray-500">読み込み中...</div>;
  }

  const levelText: Record<string, string> = {
    beginner: '初級',
    intermediate: '中級',
    advanced: '上級',
    native: 'ネイティブ',
  };

  return (
    <div className="space-y-3 py-3 relative min-h-screen pb-24">
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
      </div>

      {/* 自己紹介 */}
      <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 whitespace-pre-wrap">{profile.bio}</p>
      </div>

      {/* 言語スキル */}
      <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
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
      <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
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
      <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
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
          <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
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
          <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
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

      {/* ログアウトボタン (右下に固定) */}
      <div className="fixed bottom-20 right-4 z-50">
        <div className="relative group">
            {/* アバターアイコン */}
            <button className="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden transition-transform hover:scale-110 focus:outline-none">
                <img 
                    src={user?.user_metadata?.avatar_url || 'https://placehold.co/100?text=U'} 
                    alt="User" 
                    className="w-full h-full object-cover"
                />
            </button>
            
            {/* ホバー/クリックで表示されるメニュー */}
            <div className="absolute bottom-full right-0 mb-2 w-32 bg-white rounded-lg shadow-xl overflow-hidden hidden group-hover:block group-focus-within:block">
                <div className="p-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                    ログアウト
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
