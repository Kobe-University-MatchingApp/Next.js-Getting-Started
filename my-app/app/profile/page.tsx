import { Profile } from '@/types/profile';

// サンプルデータ
const sampleProfile: Profile = {
    id: '1',
    name: '田中 さくら',
    age: 28,
    location: '東京都渋谷区',
    occupation: 'Webデザイナー',
    bio: 'こんにちは！日本生まれ日本育ちですが、英語と韓国語を勉強しています。異文化交流が大好きで、色々な国の人と友達になりたいです🌏\n\nカフェでお茶しながら言語交換したり、一緒に美術館やイベントに行ったりしたいです。お互いの言語や文化について楽しく学び合いましょう！',
    interests: ['言語学習', '異文化交流', 'K-POP', '映画鑑賞', '料理', 'カフェ巡り'],
    images: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop'],
    nativeLanguage: '日本語',
    learningLanguages: ['英語', '韓国語'],
    languageLevel: {
        '日本語': 'native',
        '英語': 'intermediate',
        '韓国語': 'beginner',
    },
    exchangeGoals: ['会話練習', '文化交流', '友達作り', 'イベント参加'],
    studyStyle: ['カフェで会話', 'オンライン交流', 'イベント参加'],
    availability: ['平日夜', '週末'],
    nationality: '日本',
    education: '大学卒業',
};

export default function ProfilePage() {
    return (
        <div className="space-y-3 py-3">
            {/* プロフィール画像 */}
            <div className="relative bg-white rounded-lg shadow-sm overflow-hidden mx-2">
                <div className="relative h-56">
                    <img
                        src={sampleProfile.images[0]}
                        alt={sampleProfile.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <h2 className="text-xl font-bold text-white">
                            {sampleProfile.name}, {sampleProfile.age}
                        </h2>
                        <p className="text-white/90 text-xs flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {sampleProfile.location} • {sampleProfile.occupation}
                        </p>
                    </div>
                </div>
            </div>

            {/* 自己紹介 */}
            <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{sampleProfile.bio}</p>
            </div>

            {/* 言語スキル */}
            <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                <h3 className="text-sm font-bold text-gray-800 mb-2">🌐 言語</h3>
                <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {sampleProfile.nativeLanguage}
                    </span>
                    {sampleProfile.learningLanguages.map((language) => {
                        const level = sampleProfile.languageLevel?.[language] || 'beginner';
                        const levelText = {
                            beginner: '初級',
                            intermediate: '中級',
                            advanced: '上級',
                            native: 'ネイティブ',
                        };
                        return (
                            <span key={language} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {language} {levelText[level]}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* 趣味・興味 */}
            <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                <h3 className="text-sm font-bold text-gray-800 mb-2">💫 趣味</h3>
                <div className="flex flex-wrap gap-1.5">
                    {sampleProfile.interests.map((interest, index) => (
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
                    {sampleProfile.exchangeGoals.map((goal, index) => (
                        <span key={index} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                            {goal}
                        </span>
                    ))}
                </div>
            </div>

            {/* 学習スタイル */}
            {sampleProfile.studyStyle && sampleProfile.studyStyle.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">📖 学習スタイル</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {sampleProfile.studyStyle.map((style, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                {style}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* 参加可能な時間帯 */}
            {sampleProfile.availability && sampleProfile.availability.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-3 mx-2">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">🕐 参加可能時間</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {sampleProfile.availability.map((time, index) => (
                            <span key={index} className="px-2 py-1 bg-pink-50 text-pink-700 rounded text-xs">
                                {time}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* アクションボタン */}
            <div className="flex gap-2 mx-2 pb-4">
                <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold text-sm">
                    💬 メッセージ
                </button>
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg font-bold text-sm">
                    👥 友達申請
                </button>
            </div>
        </div>
    );
}
