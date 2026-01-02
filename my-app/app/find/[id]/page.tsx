// イベント一覧 → [[イベント詳細]] → 参加確認

'use client';

import { use } from 'react';
import { sampleEvents } from '@/data/events';
import Link from 'next/link';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {

  // URLパラメーターからIDを取得
  const { id } = use(params);

  // IDに基づいてイベントを検索
  const event = sampleEvents.find((e) => e.id === id);
  if (!event) return <div className="p-8 text-center">イベントが見つかりません</div>;

  // 参加者が定員に達しているかどうかを判定
  const isFull = event.currentParticipants >= (event.maxParticipants || 0);

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen pb-48 shadow-xl">

      {/* --- ヘッダー画像エリア --- */}
      <div className="relative h-64 w-full">
        <img
          src={event.images?.[0] ?? 'https://placehold.jp/800x600.png?text=No+Image'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <Link href="/find" className="absolute top-4 left-4 bg-white/90 p-2 rounded-full hover:bg-white shadow-sm transition">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
      </div>

      {/* --- メインコンテンツエリア --- */}
      <div className="p-6 space-y-8">
        <section className="space-y-4">

          {/* タイトル・カテゴリ */}
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{event.title}</h1>
            <span className="shrink-0 bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-bold">
              {event.category}
            </span>
          </div>

          {/* 場所・時間・主催者 */}
          <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">📍</span>
              <span className="font-medium">{event.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">🕒</span>
              <span className="font-medium">{event.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">👤</span>
              <span>主催者: <span className="font-bold text-gray-800">{event.organizer.name}</span></span>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* イベント詳細 */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 mb-3">イベント詳細</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* 参加予定のメンバー */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 mb-3">参加予定のメンバー</h2>
          <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
            <div className="flex -space-x-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold">
                +{Math.max(0, event.currentParticipants - 5)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">現在の参加者</p>
              <p className="text-lg font-bold text-gray-800">
                {event.currentParticipants} <span className="text-sm font-normal text-gray-500">/ {event.maxParticipants}人</span>
              </p>
            </div>
          </div>
        </section>

        {/* 趣味タグ */}
        <section>
          <div className="flex flex-wrap gap-2">
            {event.tags?.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* 参加に進むボタン */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-2xl mx-auto flex gap-4 items-center">
          <div className="flex flex-col pl-2">
            <span className="text-xs text-gray-500">参加費</span>
            <span className="text-2xl font-bold text-gray-900">¥{(event.fee ?? 0).toLocaleString()}</span>
          </div>

          <Link href={`/find/${event.id}/join`} className="flex-1">
            <button
              disabled={isFull}
              className={`w-full font-bold py-4 px-6 rounded-full shadow-lg transition-all transform active:scale-[0.98] ${isFull
                ? 'bg-gray-300 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:brightness-110'
                }`}
            >
              {isFull ? 'キャンセル待ち' : '参加に進む →'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}