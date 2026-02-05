import { Event } from '@/types/event';
import { Profile } from '@/types/profile';
import { transformSupabaseEventRows } from '@/lib/transformers/eventTransformer';
import { getProfileById } from '@/lib/profile';
import { createClient } from '@/utils/supabase/client';
import { isEventCompleted } from '@/lib/utils/eventStatus';

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
    console.error('Error fetching events:', error);
    return { byLanguages: [], byTags: [], upcoming: [] };
  }

  console.log('Supabaseから取得したイベント数:', eventsData?.length);
  console.log('イベントデータ:', eventsData);

  const allEvents = transformSupabaseEventRows(eventsData || []);

  // 終了済みのイベントを除外
  const sampleEvents = allEvents.filter(event => !isEventCompleted(event.date));
  console.log('変換後のイベント数:', allEvents.length);
  console.log('終了済み除外後のイベント数:', sampleEvents.length);
  console.log('変換後のイベント:', sampleEvents);

  // 1. イベントの言語とプロフィールの言語が一致するイベント
  const userLanguages = [
    userProfile.nativeLanguage,
    ...(userProfile.learningLanguages || [])
  ];

  console.log('ユーザーの言語:', userLanguages);
  console.log('ユーザーの興味:', userProfile.interests);

  const byLanguages = sampleEvents.filter(event =>
    event.languages?.some(lang => userLanguages.includes(lang))
  );

  console.log('言語でフィルタリングしたイベント:', byLanguages);
  console.log('言語でフィルタリングしたイベントのID:', byLanguages.map(e => e.id));

  // 2. イベントのタグとプロフィールの興味が一致するイベント
  // 注：言語にマッチしているイベントも含める（同じイベントが両セクションに表示される可能性あり）
  const byTags = sampleEvents.filter(event => {
    const hasMatchingTag = event.tags?.some(tag => userProfile.interests.includes(tag));

    console.log(`イベント "${event.title}" (ID: ${event.id}) - タグ: ${event.tags}, マッチしているタグ: ${hasMatchingTag}`);

    if (hasMatchingTag) {
      console.log(`✓ このイベントはタグ条件に追加されます`);
    }

    return hasMatchingTag;
  });

  console.log('タグでフィルタリングしたイベント:', byTags);
  console.log('タグでフィルタリングしたイベントのID:', byTags.map(e => e.id));

  // 3. 5日以内のすべてのイベント
  const upcoming = getUpcomingEventsWithin5Days(sampleEvents);
  console.log('5日以内のイベント:', upcoming);
  console.log('5日以内のイベントのID:', upcoming.map(e => e.id));

  return { byLanguages, byTags, upcoming };
}

/**
 * ユーザーの認証セッションから現在のユーザーIDを取得します
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('Error getting current user:', error);
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