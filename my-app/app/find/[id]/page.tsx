// イベント一覧 → [[イベント詳細]] → 参加確認

import { supabase } from '@/lib/supabaseClient';
import { transformSupabaseEventRow } from '@/lib/transformers/eventTransformer';
import Link from 'next/link';
import EventDetailClient from './_components/EventDetailClient';
import { isEventCompleted } from '@/lib/utils/eventStatus';
import { getEventParticipantsWithProfile } from '@/lib/eventParticipants';
import { logger } from '@/lib/utils/logger';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {

  // URLパラメーターからIDを取得
  const { id } = await params;

  // Supabaseから特定のイベントを取得
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();

  // エラーハンドリング
  if (error || !data) {
    logger.error('Supabaseからのデータ取得エラー:', error);
    return <div className="p-8 text-center animate-slide-in-right">イベントが見つかりません</div>;
  }

  // データを変換
  let event = transformSupabaseEventRow(data);

  // organizer_avatar が null の場合、profiles テーブルから画像を取得
  if ((!event.organizer.avatar || !event.organizer.avatar.trim()) && !event.organizer.id.startsWith('guest_')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('images')
        .eq('id', event.organizer.id)
        .single();

      if (profile?.images && Array.isArray(profile.images) && profile.images.length > 0) {
        event = {
          ...event,
          organizer: {
            ...event.organizer,
            avatar: profile.images[0],
          },
        };
      }
    } catch (err) {
      logger.error(`Failed to fetch profile image for organizer ${event.organizer.id}:`, err);
    }
  }

  // イベントが終了しているかどうかを判定
  const isCompleted = isEventCompleted(event.date);

  // 参加者が定員に達しているかどうかを判定
  const isFull = event.currentParticipants >= (event.maxParticipants || 0);

  // 参加者プロフィール情報を取得
  const participants = await getEventParticipantsWithProfile(id);

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen pb-48 shadow-xl animate-slide-in-right">

      {/* --- ヘッダー画像エリア --- */}
      <div className="relative h-64 w-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden">
        {event.images && event.images.length > 0 ? (
          <img
            src={event.images[0]}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : event.organizer.avatar ? (
          <img
            src={event.organizer.avatar}
            alt={event.organizer.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-5xl font-bold text-white">{event.organizer.name.charAt(0)}</span>
          </div>
        )}
        <Link href="/find" className="absolute top-4 left-4 bg-white/90 p-2 rounded-full hover:bg-white shadow-md transition">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
      </div>

      {/* --- メインコンテンツエリア --- */}
      <div className="p-6 space-y-8">
        <section className="space-y-4">

          {/* タイトル・カテゴリ */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className={`text-2xl font-bold leading-tight ${isCompleted ? 'text-gray-500' : 'text-gray-900'
                  }`}>{event.title}</h1>
                {isCompleted && (
                  <span className="px-2 py-1 bg-gray-400 text-white rounded text-sm font-bold">
                    終了
                  </span>
                )}
              </div>
            </div>
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
              {participants.slice(0, 5).map((participant) => (
                <div key={participant.id} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden flex-shrink-0" title={participant.participantName}>
                  {participant.participantAvatar ? (
                    <img
                      src={participant.participantAvatar}
                      alt={participant.participantName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                      {participant.participantName.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
              {participants.length > 5 && (
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold flex-shrink-0">
                  +{participants.length - 5}
                </div>
              )}
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
      <EventDetailClient event={event} isCompleted={isCompleted} />
    </div>
  );
}