import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types/profile';

export async function getProfile(name: String): Promise<Profile | null> {

    // 'profiles'テーブルからデータを1件取得
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('name', name) // ★ここを追加！名前で検索します
        .single(); // .limit(1) の代わりに .single() だけでOK（1件に絞っているため）

    // エラーハンドリング
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    // DBのデータをTypeScriptの型に合わせて変換
    const profile: Profile = {
        id: data.id,
        name: data.name,
        age: data.age,
        location: data.location,
        occupation: data.occupation,
        bio: data.bio,
        interests: data.interests || [],
        images: data.images || [],
        nativeLanguage: data.native_language,
        learningLanguages: data.learning_languages || [],
        // JSON型を適切な型として扱うためのキャスト
        languageLevel: data.language_level as Profile['languageLevel'],
        exchangeGoals: data.exchange_goals || [],
        studyStyle: data.study_style || [],
        availability: data.availability || [],
        nationality: data.nationality || undefined,
        education: data.education || undefined,
    };

    return profile;
}