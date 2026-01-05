import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types/profile';

export async function getProfile(name: String): Promise<Profile | null> {

    // 'profiles'テーブルからデータを1件取得
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('name', name) // ★ここを追加！名前で検索します
        .maybeSingle(); // .single()の代わりに.maybeSingle()を使用（レコードが見つからない場合nullを返す）

    // エラーハンドリング（レコードが見つからない場合はエラーではない）
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    // データが見つからない場合
    if (!data) {
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

export async function getProfileById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching profile by id:', error);
        return null;
    }

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
        languageLevel: data.language_level as Profile['languageLevel'],
        exchangeGoals: data.exchange_goals || [],
        studyStyle: data.study_style || [],
        availability: data.availability || [],
        nationality: data.nationality || undefined,
        education: data.education || undefined,
    };

    return profile;
}