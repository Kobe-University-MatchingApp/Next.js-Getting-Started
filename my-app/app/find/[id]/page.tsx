'use client';

import { useState } from 'react';
import { Event } from '@/types/event';
import Link from 'next/link';

// サンプルデータ（実際はAPIから取得）
const sampleEvents: { [key: string]: Event } = {
    '1': {
        id: '1',
        title: '日本語&英語で話そう！カフェ交流会',
        description:
            '渋谷のおしゃれなカフェで、日本語と英語を使って楽しく交流しましょう！初心者の方も大歓迎です。\n\nこのイベントでは、少人数のグループに分かれて、様々なトピックについて話し合います。言語学習だけでなく、新しい友達を作ったり、異文化について学んだりすることができます。\n\nお茶を飲みながらリラックスした雰囲気で、自然な会話を楽しみましょう。英語が苦手な方も、日本語を勉強している外国の方がサポートしてくれるので安心です。',
        category: '言語交換',
        date: '2025-12-15',
        time: '14:00',
        location: '渋谷カフェ スターバックス 渋谷店',
        maxParticipants: 15,
        currentParticipants: 8,
        fee: 500,
        languages: ['日本語', '英語'],
        organizer: {
            id: 'u1',
            name: '山田 太郎',
            avatar:
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            rating: { average: 4.5, count: 32 },
        },
        images: [
            'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=600&fit=crop',
        ],
        introvertExtrovertStats: {
            introvertCount: 5,
            extrovertCount: 3,
        },
        tags: ['初心者歓迎', 'カフェ', '気軽'],
    },
    '2': {
        id: '2',
        title: '韓国料理を作ろう！料理教室',
        description:
            '本場の韓国料理を一緒に作りましょう！キムチチゲとチヂミを作ります。料理しながら韓国の文化についても学べます。\n\n経験豊富な韓国人シェフが丁寧に教えてくれるので、料理初心者でも大丈夫です。作った料理はみんなで楽しく食べましょう！',
        category: '料理体験',
        date: '2025-12-20',
        time: '18:00',
        location: '新宿クッキングスタジオ',
        maxParticipants: 12,
        currentParticipants: 5,
        fee: 3000,
        languages: ['日本語', '韓国語'],
        organizer: {
            id: 'u2',
            name: 'キム ミンジ',
            avatar:
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
            rating: { average: 4.8, count: 20 },
        },
        images: [
            'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=600&fit=crop',
        ],
        introvertExtrovertStats: {
            introvertCount: 6,
            extrovertCount: 6,
        },
        tags: ['料理', '韓国文化', '食事付き'],
    },
    '3': {
        id: '3',
        title: '着物体験＆浅草散策',
        description:
            '日本の伝統文化、着物を体験してみませんか？プロの着付け師が美しく着付けてくれます。\n\n着物を着たら浅草寺や仲見世通りを散策し、日本の伝統的な雰囲気を楽しみましょう。写真撮影スポットもたくさんあるので、素敵な思い出を作れます。外国の方大歓迎！',
        category: '文化体験',
        date: '2025-12-22',
        time: '10:00',
        location: '浅草 着物レンタル店',
        maxParticipants: 10,
        currentParticipants: 7,
        fee: 4000,
        languages: ['日本語', '英語', '中国語'],
        organizer: {
            id: 'u3',
            name: '佐藤 花子',
            avatar:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
            rating: { average: 4.7, count: 15 },
        },
        images: [
            'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop',
        ],
        introvertExtrovertStats: {
            introvertCount: 4,
            extrovertCount: 6,
        },
        tags: ['着物', '観光', '写真撮影'],
    },
    '4': {
        id: '4',
        title: 'サッカーで国際交流！',
        description:
            '国籍関係なく、サッカーを通じて友達を作りましょう！初心者から経験者まで大歓迎です。\n\nチーム分けをして、楽しく試合を行います。スポーツを通じて言葉の壁を超えた交流ができます。試合後は近くのカフェで懇親会も予定しています。',
        category: 'スポーツ',
        date: '2025-12-18',
        time: '16:00',
        location: '代々木公園 フットサルコート',
        maxParticipants: 20,
        currentParticipants: 15,
        fee: 1000,
        languages: ['日本語', '英語', 'スペイン語'],
        organizer: {
            id: 'u4',
            name: '田中 健太',
            avatar:
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
            rating: { average: 4.2, count: 25 },
        },
        images: [
            'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop',
        ],
        introvertExtrovertStats: {
            introvertCount: 8,
            extrovertCount: 12,
        },
        tags: ['スポーツ', '運動', 'チームワーク'],
    },
    '5': {
        id: '5',
        title: '富士山日帰りツアー',
        description:
            '日本のシンボル、富士山を見に行きましょう！快適なバスで日帰りツアーに出かけます。\n\n富士五湖周辺の絶景スポットを巡り、富士山の美しさを堪能できます。ランチは地元の名物料理を楽しみ、お土産購入の時間もあります。写真好きの方にもおすすめです！',
        category: '観光',
        date: '2025-12-25',
        time: '07:00',
        location: '新宿駅西口 集合',
        maxParticipants: 30,
        currentParticipants: 22,
        fee: 8000,
        languages: ['日本語', '英語'],
        organizer: {
            id: 'u5',
            name: '鈴木 一郎',
            avatar:
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
            rating: { average: 4.9, count: 40 },
        },
        images: [
            'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop',
        ],
        introvertExtrovertStats: {
            introvertCount: 10,
            extrovertCount: 12,
        },
        tags: ['観光', '富士山', 'バスツアー'],
    },
    '6': {
        id: '6',
        title: '中国茶会で文化交流',
        description:
            '本格的な中国茶を楽しみながら、中国の文化や歴史について語り合いましょう。\n\n様々な種類の中国茶を試飲でき、茶道の基本も学べます。お茶菓子も用意しているので、ゆったりとした時間を過ごせます。中国文化に興味がある方、お茶が好きな方におすすめです。',
        category: 'その他',
        date: '2025-12-28',
        time: '15:00',
        location: '銀座 中国茶カフェ',
        maxParticipants: 8,
        currentParticipants: 3,
        fee: 2000,
        languages: ['日本語', '中国語'],
        organizer: {
            id: 'u6',
            name: '王 麗',
            avatar:
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
            rating: { average: 4.6, count: 18 },
        },
        images: [
            'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&h=600&fit=crop',
        ],
        introvertExtrovertStats: {
            introvertCount: 2,
            extrovertCount: 6,
        },
        tags: ['お茶', '文化', 'リラックス'],
    },
};

export default function EventDetailPage({ params }: { params: { id: string } }) {
    const event = sampleEvents[params.id];
    const [isJoining, setIsJoining] = useState(false);

    if (!event) {
        return (
            <div className="p-4 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 text-lg mb-4">イベントが見つかりませんでした</p>
                    <Link
                        href="/find"
                        className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors inline-block"
                    >
                        イベント一覧に戻る
                    </Link>
                </div>
            </div>
        );
    }

    const handleJoin = () => {
        setIsJoining(true);
        setTimeout(() => {
            alert('イベントに参加申し込みしました！');
            setIsJoining(false);
        }, 1000);
    };

    const spotsLeft = event.maxParticipants - event.currentParticipants;
    const isFull = spotsLeft <= 0;

    return (
        <div className="p-4 pb-20">
            {/* 戻るボタン */}
            <Link href="/find">
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">戻る</span>
                </button>
            </Link>

            {/* イベント画像 */}
            <div className="relative h-64 md:h-96 bg-white rounded-2xl shadow-md overflow-hidden mb-6">
                <img
                    src={event.images?.[0] || 'https://via.placeholder.com/800x600'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-purple-700 rounded-full text-sm font-bold shadow-lg">
                        {event.category}
                    </span>
                </div>
            </div>

            {/* イベントタイトル */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                    {event.title}
                </h1>

                {/* タグ */}
                {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {event.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* 主催者情報 */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <img
                        src={event.organizer.avatar}
                        alt={event.organizer.name}
                        className="w-12 h-12 rounded-full"
                    />
                    <div>
                        <p className="text-xs text-gray-500">主催者</p>
                        <p className="font-medium text-gray-800">{event.organizer.name}</p>
                        {event.organizer.rating && (
                            <p className="text-xs text-yellow-500 flex items-center gap-1 mt-0.5">
                                <span>★ {event.organizer.rating.average.toFixed(1)}</span>
                                <span className="text-gray-400">
                                    ({event.organizer.rating.count}件)
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* イベント詳細情報 */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">イベント詳細</h2>

                {/* 日時 */}
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <div>
                        <p className="text-sm text-gray-500">日時</p>
                        <p className="font-medium text-gray-800">
                            {event.date} {event.time}〜
                        </p>
                    </div>
                </div>

                {/* 場所 */}
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    <div>
                        <p className="text-sm text-gray-500">場所</p>
                        <p className="font-medium text-gray-800">{event.location}</p>
                    </div>
                </div>

                {/* 参加費 */}
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <div>
                        <p className="text-sm text-gray-500">参加費</p>
                        <p className="font-bold text-purple-600 text-lg">
                            {event.fee ? `¥${event.fee.toLocaleString()}` : '無料'}
                        </p>
                    </div>
                </div>

                {/* 参加人数 */}
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-2">参加状況</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${(event.currentParticipants / event.maxParticipants) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <p className="font-medium text-gray-800 whitespace-nowrap">
                                {event.currentParticipants}/{event.maxParticipants}人
                            </p>
                        </div>
                        {!isFull && (
                            <p className="text-sm text-gray-600 mt-1">残り{spotsLeft}名</p>
                        )}
                        {isFull && (
                            <p className="text-sm text-red-500 mt-1 font-medium">満員です</p>
                        )}
                    </div>
                </div>

                {/* 対応言語 */}
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                    </svg>
                    <div>
                        <p className="text-sm text-gray-500 mb-2">対応言語</p>
                        <div className="flex flex-wrap gap-2">
                            {event.languages.map((lang) => (
                                <span
                                    key={lang}
                                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                                >
                                    {lang}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* I / E 分布 */}
                {event.introvertExtrovertStats && (
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-purple-500 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-2">参加者のI/Eバランス</p>
                            {(() => {
                                const { introvertCount, extrovertCount } =
                                    event.introvertExtrovertStats!;
                                const total = introvertCount + extrovertCount || 1;
                                const introPercent = Math.round(
                                    (introvertCount / total) * 100
                                );
                                const extroPercent = 100 - introPercent;
                                return (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="w-14 text-xs font-medium text-gray-700">
                                                Introvert
                                            </span>
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-2 bg-purple-500"
                                                    style={{ width: `${introPercent}%` }}
                                                />
                                            </div>
                                            <span className="w-10 text-right text-xs text-gray-600">
                                                {introPercent}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-14 text-xs font-medium text-gray-700">
                                                Extrovert
                                            </span>
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-2 bg-pink-500"
                                                    style={{ width: `${extroPercent}%` }}
                                                />
                                            </div>
                                            <span className="w-10 text-right text-xs text-gray-600">
                                                {extroPercent}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>

            {/* イベント説明 */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">イベントについて</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {event.description}
                </p>
            </div>

            {/* 参加ボタン（固定） */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                <div className="max-w-6xl mx-auto flex gap-3">
                    <button
                        onClick={handleJoin}
                        disabled={isFull || isJoining}
                        className={`flex-1 py-4 rounded-full font-bold shadow-lg transition-all ${isFull
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl hover:scale-[1.02]'
                            }`}
                    >
                        {isJoining ? '処理中...' : isFull ? '満員です' : '🎉 このイベントに参加する'}
                    </button>
                    <button className="px-6 py-4 border-2 border-purple-500 text-purple-500 rounded-full font-bold hover:bg-purple-50 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
