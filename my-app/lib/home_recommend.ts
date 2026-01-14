import { Event } from '@/types/event'; // 型定義のパスは環境に合わせてください
import { supabase } from '@/lib/supabaseClient';
import { transformSupabaseEventRows } from '@/lib/transformers/eventTransformer';


// モックのユーザー情報
const mockUser = {
  id: 'current-user',
  name: '田中 太郎',
  faculty: '国際学部',
  interests: ['言語交換', 'カフェ', '英語'], // 基準1: 登録タグ
  historyCategories: ['言語交換'],           // 基準2: 過去参加ジャンル
};

// 4つのカテゴリに分類されたデータを返す型
type CategorizedEvents = {
  byTags: Event[];
  byHistory: Event[];
  byFaculty: Event[];
  byUpcoming: Event[];
};

export async function getHomeEvents(): Promise<CategorizedEvents> {
  const today = new Date('2025-12-01'); // テスト用の基準日

  // Supabaseからイベントデータを取得
  const { data: eventsData, error } = await supabase
    .from('events')
    .select('*');

  if (error) {
    console.error('Error fetching events:', error);
    return { byTags: [], byHistory: [], byFaculty: [], byUpcoming: [] };
  }

  const sampleEvents = transformSupabaseEventRows(eventsData || []);
  const byTags = sampleEvents.filter(event => 
    event.tags?.some(tag => mockUser.interests.includes(tag))
  );

  // 2. 過去参加したのと似たイベント (カテゴリ一致)
  const byHistory = sampleEvents.filter(event => 
    mockUser.historyCategories.includes(event.category) &&
    !byTags.includes(event) // (オプション) 上ですでに出たものは重複させない場合
  );

  // 3. 同じ学部/研究科に関連 (ここではタグや説明文で判定)
  const byFaculty = sampleEvents.filter(event => 
    (event.tags?.includes('国際') || event.description.includes('国際')) &&
    !byTags.includes(event) && !byHistory.includes(event)
  );

  // 4. 開催日が近いのに人が少ない (7日以内 & 定員50%以下)
  const byUpcoming = sampleEvents.filter(event => {
    const eventDate = new Date(event.date);
    const daysDiff = (eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    const fillRate = event.currentParticipants / (event.maxParticipants || 1);
    
    return daysDiff >= 0 && daysDiff <= 7 && fillRate < 0.5 &&
           !byTags.includes(event) && !byHistory.includes(event) && !byFaculty.includes(event);
  });

  return { byTags, byHistory, byFaculty, byUpcoming };
}

export function getCurrentUserName() {
  return mockUser.name;
}