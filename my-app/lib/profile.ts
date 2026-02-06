import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types/profile';
import { generateShortId } from '@/lib/utils/id_generator';
import { logger } from '@/lib/utils/logger';

// DBデータをProfile型に変換するヘルパー関数
function mapToProfile(data: any): Profile {
    return {
        id: data.id,
        shortId: data.short_id,
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
}


export async function getProfile(name: String): Promise<Profile | null> {

    // 'profiles'テーブルからデータを1件取得
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('name', name) // ★ここを追加！名前で検索します
        .maybeSingle(); // .single()の代わりに.maybeSingle()を使用（レコードが見つからない場合nullを返す）

    // エラーハンドリング（レコードが見つからない場合はエラーではない）
    if (error) {
        logger.error('Error fetching profile:', error);
        return null;
    }

    // データが見つからない場合
    if (!data) {
        return null;
    }

    return mapToProfile(data);
}

export async function getProfileById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        logger.error('Error fetching profile by id:', error);
        return null;
    }

    // short_idがない場合は自動生成して保存する（自己修復）
    if (!data.short_id) {
        const newShortId = generateShortId();
        await supabase
            .from('profiles')
            .update({ short_id: newShortId })
            .eq('id', id);
        data.short_id = newShortId;
    }

    return mapToProfile(data);
}

export async function getProfileByShortId(shortId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('short_id', shortId)
        .maybeSingle();

    if (error) {
        logger.error('Error fetching profile by short_id:', error);
        return null;
    }

    if (!data) {
        return null;
    }

    return mapToProfile(data);
}