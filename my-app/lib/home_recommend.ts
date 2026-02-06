import { Event } from '@/types/event';
import { Profile } from '@/types/profile';
import { transformSupabaseEventRows } from '@/lib/transformers/eventTransformer';
import { getProfileById } from '@/lib/profile';
import { createClient } from '@/utils/supabase/client';
import { isEventCompleted } from '@/lib/utils/eventStatus';
import { logger } from '@/lib/utils/logger';

// 2つのカテゴリに分類されたデータを返す型
type CategorizedEvents = {
  byLanguages: Event[];
  byTags: Event[];
  upcoming: Event[];
};

/**
 * 現在から5日以内のイベントを取得
 */
function getUpcomingEventsWithin5Days(events: Event[]): Event[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fiveDaysLater = new Date(today);
  fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);

  return events
    .filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today && eventDate <= fiveDaysLater;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * ホーム画面用のおすすめイベントを取得
 * プロフィール情報に基づいて3つの基準でフィルタリングします
 */
export async function getHomeEvents(userProfile: Profile): Promise<CategorizedEvents> {
  const supabase = createClient();

  // Supabaseからイベントデータを取得
  const { data: eventsData, error } = await supabase
    .from('events')
    .select('*');

  if (error) {
    logger.error('Error fetching events:', error);
    return { byLanguages: [], byTags: [], upcoming: [] };
  }

  let allEvents = transformSupabaseEventRows(eventsData || []);

  // organizer_avatar が null の場合、profiles テーブルから画像を取得
  allEvents = await Promise.all(
    allEvents.map(async (event) => {
      // organizer_avatar が既に設定されている場合はスキップ
      if (event.organizer.avatar && event.organizer.avatar.trim()) {
        return event;
      }

      // organizer_id がゲストの場合（guest_で始まる）はスキップ
      if (event.organizer.id.startsWith('guest_')) {
        return event;
      }

      try {
        // profiles テーブルから画像を取得
        const { data: profile } = await supabase
          .from('profiles')
          .select('images')
          .eq('id', event.organizer.id)
          .single();

        if (profile?.images && Array.isArray(profile.images) && profile.images.length > 0) {
          return {
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

      return event;
    })
  );

  // 終了済みのイベントを除外
  const sampleEvents = allEvents.filter(event => !isEventCompleted(event.date));

  // 1. イベントの言語とプロフィールの言語が一致するイベント
  const userLanguages = [
    userProfile.nativeLanguage,
    ...(userProfile.learningLanguages || [])
  ];

  const byLanguages = sampleEvents.filter(event =>
    event.languages?.some(lang => userLanguages.includes(lang))
  );

  // 2. イベントのタグとプロフィールの興味が一致するイベント
  // 注：言語にマッチしているイベントも含める（同じイベントが両セクションに表示される可能性あり）
  const byTags = sampleEvents.filter(event =>
    event.tags?.some(tag => userProfile.interests.includes(tag))
  );

  // 3. 5日以内のすべてのイベント
  const upcoming = getUpcomingEventsWithin5Days(sampleEvents);

  return { byLanguages, byTags, upcoming };
}

/**
 * ユーザーの認証セッションから現在のユーザーIDを取得します
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    logger.error('Error getting current user:', error);
    return null;
  }

  return user;
}

/**
 * 現在ログインしているユーザーのプロフィールを取得
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // user.idでプロフィールを取得
  const profile = await getProfileById(user.id);

  return profile;
}